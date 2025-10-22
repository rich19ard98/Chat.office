// services/chatService.js
import { API_URL } from "../helpers/fetchApi";

export const chatService = {
  // Récupérer les conversations de l'utilisateur
  async getConversations(userId) {
    try {
      const response = await fetch(`${API_URL}/api/conversations/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des conversations');
      return await response.json();
    } catch (error) {
      console.error('Erreur getConversations:', error);
      throw error;
    }
  },

  // Récupérer les utilisateurs disponibles pour chat
  async getAvailableUsers(currentUserId) {
    try {
      const response = await fetch(`${API_URL}/api/users/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      const users = await response.json();
      
      // Filtrer l'utilisateur courant si nécessaire
      return users.filter(user => user.ID_UTILISATEUR !== currentUserId);
    } catch (error) {
      console.error('Erreur getAvailableUsers:', error);
      throw error;
    }
  },

  // Créer une nouvelle conversation
  async createConversation(participantIds, conversationName = null) {
    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          participants: participantIds,
          name: conversationName,
          type: participantIds.length > 2 ? 'group' : 'direct'
        })
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création de la conversation');
      return await response.json();
    } catch (error) {
      console.error('Erreur createConversation:', error);
      throw error;
    }
  },

  // Rechercher des utilisateurs
  async searchUsers(query) {
    try {
      const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la recherche');
      return await response.json();
    } catch (error) {
      console.error('Erreur searchUsers:', error);
      throw error;
    }
  }
};