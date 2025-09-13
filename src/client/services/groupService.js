import apiService from './api.js';

class GroupService {
  // Get group members
  async getGroupMembers(groupId) {
    try {
      const response = await apiService.getGroupMembers(groupId);
      return response;
    } catch (error) {
      console.error('Get group members failed:', error);
      throw error;
    }
  }

  // Invite member to group
  async inviteMember(groupId, invitationData) {
    try {
      const response = await apiService.inviteMember(groupId, invitationData);
      return response;
    } catch (error) {
      console.error('Invite member failed:', error);
      throw error;
    }
  }

  // Update member role
  async updateMemberRole(groupId, memberId, role) {
    try {
      const response = await apiService.updateMemberRole(groupId, memberId, role);
      return response;
    } catch (error) {
      console.error('Update member role failed:', error);
      throw error;
    }
  }

  // Remove member from group
  async removeMember(groupId, memberId) {
    try {
      const response = await apiService.removeMember(groupId, memberId);
      return response;
    } catch (error) {
      console.error('Remove member failed:', error);
      throw error;
    }
  }

  // Get invitation details
  async getInvitationDetails(token) {
    try {
      const response = await apiService.getInvitationDetails(token);
      return response;
    } catch (error) {
      console.error('Get invitation details failed:', error);
      throw error;
    }
  }

  // Accept invitation
  async acceptInvitation(token, userData) {
    try {
      const response = await apiService.acceptInvitation(token, userData);
      
      // Store token and user data if successful
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('Accept invitation failed:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const groupService = new GroupService();
export default groupService;


