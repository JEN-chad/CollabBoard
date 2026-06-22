import React, { createContext, useState, useCallback } from 'react';
import boardService from '../services/boardService';
import cardService from '../services/cardService';
import socket from '../socket';

export const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await boardService.getBoards();
      setBoards(data);
      return { success: true, data };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch boards';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBoardById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await boardService.getBoardById(id);
      setCurrentBoard(data);
      return { success: true, data };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to fetch board details';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const createBoard = async (boardData) => {
    setLoading(true);
    setError(null);
    try {
      const newBoard = await boardService.createBoard(boardData);
      setBoards((prevBoards) => [newBoard, ...prevBoards]);
      return { success: true, data: newBoard };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create board';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateBoard = async (id, boardData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBoard = await boardService.updateBoard(id, boardData);
      
      // Update in boards list
      setBoards((prevBoards) =>
        prevBoards.map((b) => (b._id === id ? updatedBoard : b))
      );

      // Update current board if it matches
      if (currentBoard && currentBoard._id === id) {
        setCurrentBoard(updatedBoard);
      }

      return { success: true, data: updatedBoard };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update board';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteBoard = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await boardService.deleteBoard(id);
      
      // Filter out from list
      setBoards((prevBoards) => prevBoards.filter((b) => b._id !== id));

      // Clear current board if active
      if (currentBoard && currentBoard._id === id) {
        setCurrentBoard(null);
      }

      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete board';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (cardData) => {
    setLoading(true);
    setError(null);
    try {
      const newCard = await cardService.createCard(cardData);
      setCurrentBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: [...(prev.cards || []), newCard]
        };
      });
      socket.emit('card:create', { boardId: newCard.boardId, card: newCard });
      return { success: true, data: newCard };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create card';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateCardDetails = async (cardId, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const cardToUpdate = currentBoard.cards.find(c => c._id === cardId);
      const payload = {
        ...updatedData,
        version: cardToUpdate ? cardToUpdate.version : undefined
      };
      
      const updatedCard = await cardService.updateCard(cardId, payload);
      
      setCurrentBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.map((c) => (c._id === cardId ? updatedCard : c))
        };
      });
      socket.emit('card:update', { boardId: updatedCard.boardId, card: updatedCard });
      return { success: true, data: updatedCard };
    } catch (err) {
      const isConflict = err.response?.status === 409;
      const errMsg = err.response?.data?.message || 'Failed to update card';
      
      if (isConflict && err.response?.data?.card) {
        const latestCard = err.response.data.card;
        setCurrentBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            cards: prev.cards.map((c) => (c._id === cardId ? latestCard : c))
          };
        });
        return { success: false, conflict: true, latestCard, error: errMsg };
      }
      
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const removeCard = async (cardId) => {
    setLoading(true);
    setError(null);
    try {
      const boardId = currentBoard?._id;
      await cardService.deleteCard(cardId);
      setCurrentBoard((prev) => {
        if (!prev) return prev;
        
        const removedCard = prev.cards.find((c) => c._id === cardId);
        if (!removedCard) return prev;

        const remainingCards = prev.cards.filter((c) => c._id !== cardId);
        
        const updatedCards = remainingCards.map((c) => {
          if (c.columnId === removedCard.columnId && c.position > removedCard.position) {
            return { ...c, position: c.position - 1 };
          }
          return c;
        });

        return {
          ...prev,
          cards: updatedCards
        };
      });
      if (boardId) {
        socket.emit('card:delete', { boardId, cardId });
      }
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete card';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <BoardContext.Provider
      value={{
        boards,
        currentBoard,
        loading,
        error,
        fetchBoards,
        fetchBoardById,
        createBoard,
        updateBoard,
        deleteBoard,
        setCurrentBoard,
        addCard,
        updateCardDetails,
        removeCard
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
