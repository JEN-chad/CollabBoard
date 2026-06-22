import { useCallback } from 'react';
import { useBoards } from './useBoards';
import cardService from '../services/cardService';
import socket from '../socket';

/**
 * Custom hook to handle optimistic drag-and-drop updates, socket emission,
 * API persistence, conflict resolution, and rollback logic.
 * 
 * @param {Function} onConflict Callback triggered during updates conflict or failure
 */
export const useOptimisticCards = (onConflict) => {
  const { currentBoard, setCurrentBoard, fetchBoardById } = useBoards();

  const moveCardOptimistic = useCallback(async (
    cardId,
    sourceCol,
    destCol,
    sourceIndex,
    destIndex
  ) => {
    if (!currentBoard || !currentBoard.cards) {
      return { success: false, error: 'No active board' };
    }

    // 1. Capture snapshot of current cards list for potential rollback
    const originalCardsSnapshot = JSON.parse(JSON.stringify(currentBoard.cards));
    
    // Find the card being dragged
    const dragCard = currentBoard.cards.find((c) => c._id === cardId);
    if (!dragCard) {
      return { success: false, error: 'Card not found' };
    }

    const originalCardVersion = dragCard.version;

    // 2. Perform local state updates instantly
    const otherCards = originalCardsSnapshot.filter((c) => c._id !== cardId);
    let updatedCards = [];

    if (sourceCol === destCol) {
      // Reordering in the same column
      const colCards = otherCards
        .filter((c) => c.columnId === sourceCol)
        .sort((a, b) => a.position - b.position);
      
      // Insert card at new index
      colCards.splice(destIndex, 0, { ...dragCard });
      
      // Re-assign positions sequentially
      colCards.forEach((c, idx) => {
        c.position = idx;
      });

      updatedCards = [
        ...otherCards.filter((c) => c.columnId !== sourceCol),
        ...colCards,
      ];
    } else {
      // Moving to a different column
      const sourceColCards = otherCards
        .filter((c) => c.columnId === sourceCol)
        .sort((a, b) => a.position - b.position);
      const destColCards = otherCards
        .filter((c) => c.columnId === destCol)
        .sort((a, b) => a.position - b.position);

      // Re-assign source column positions sequentially
      sourceColCards.forEach((c, idx) => {
        c.position = idx;
      });

      // Insert card into destination column and re-assign positions
      destColCards.splice(destIndex, 0, { ...dragCard, columnId: destCol });
      destColCards.forEach((c, idx) => {
        c.position = idx;
      });

      updatedCards = [
        ...otherCards.filter((c) => c.columnId !== sourceCol && c.columnId !== destCol),
        ...sourceColCards,
        ...destColCards,
      ];
    }

    // Sort cards for layout stability
    updatedCards.sort((a, b) => {
      if (a.columnId !== b.columnId) return a.columnId.localeCompare(b.columnId);
      return a.position - b.position;
    });

    // Apply UI update immediately
    setCurrentBoard((prev) => ({
      ...prev,
      cards: updatedCards,
    }));

    // 3. Emit socket event immediately (broadcasting to other clients)
    console.log('[useOptimisticCards] Emitting card:move immediately');
    socket.emit('card:move', {
      boardId: currentBoard._id,
      cardId,
      sourceCol,
      destCol,
      sourceIndex,
      destIndex,
      version: originalCardVersion,
    });

    // 4. Server validation via REST API
    try {
      const updatedCard = await cardService.updateCard(cardId, {
        columnId: destCol,
        position: destIndex,
        version: originalCardVersion,
      });

      console.log('[useOptimisticCards] Move successful, server version is now:', updatedCard.version);

      // 5. Reconcile Response: Success (Save final version in state)
      setCurrentBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.map((c) => (c._id === cardId ? updatedCard : c)),
        };
      });

      // Broadcast finalized card (with new version) to all other clients
      socket.emit('card:update', {
        boardId: currentBoard._id,
        card: updatedCard,
      });

      return { success: true, card: updatedCard };
    } catch (err) {
      console.warn('[useOptimisticCards] Move failed, starting rollback/reconciliation flow:', err);

      const isConflict = err.response?.status === 409;
      const errMsg = err.response?.data?.message || 'Failed to move card';

      if (isConflict && err.response?.data?.card) {
        const latestCard = err.response.data.card;

        // 5. Reconcile Response: Conflict Resolution (409)
        // Rollback local cards to original state, but place card X in its latest server state
        setCurrentBoard((prev) => {
          if (!prev) return prev;
          const rolledBackAndSynced = originalCardsSnapshot.map((c) =>
            c._id === cardId ? latestCard : c
          );
          return {
            ...prev,
            cards: rolledBackAndSynced,
          };
        });

        // Broadcast latest correct card to revert other clients
        socket.emit('card:update', {
          boardId: currentBoard._id,
          card: latestCard,
        });

        // Trigger full board fetch to ensure all other card positions are 100% correct
        fetchBoardById(currentBoard._id);

        if (onConflict) {
          onConflict(`Conflict: Card was updated by another user. Reverted to database state.`);
        }

        return { success: false, conflict: true, latestCard, error: errMsg };
      } else {
        // 5. Reconcile Response: General Failure (network issue, access denied, etc.)
        // Rollback local UI to pre-drag state
        setCurrentBoard((prev) => ({
          ...prev,
          cards: originalCardsSnapshot,
        }));

        // Broadcast reverse move to restore other clients
        console.log('[useOptimisticCards] Emitting rollback card:move');
        socket.emit('card:move', {
          boardId: currentBoard._id,
          cardId,
          sourceCol: destCol,
          destCol: sourceCol,
          sourceIndex: destIndex,
          destIndex: sourceIndex,
          version: originalCardVersion,
        });

        // Send card:update as a final sync check
        socket.emit('card:update', {
          boardId: currentBoard._id,
          card: dragCard,
        });

        if (onConflict) {
          onConflict(errMsg);
        }

        return { success: false, error: errMsg };
      }
    }
  }, [currentBoard, setCurrentBoard, fetchBoardById, onConflict]);

  return {
    moveCardOptimistic,
  };
};
