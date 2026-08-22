import { api } from './api';
import { AppNotification } from '../types/notification';

export const notificationService = {
  async getMyNotifications(): Promise<{
    success: boolean;
    count: number;
    unreadCount: number;
    notifications: AppNotification[];
  }> {
    return api.get<{
      success: boolean;
      count: number;
      unreadCount: number;
      notifications: AppNotification[];
    }>('/notifications/me');
  },

  async getAll(): Promise<{ success: boolean; count: number; notifications: AppNotification[] }> {
    return api.get<{ success: boolean; count: number; notifications: AppNotification[] }>('/notifications');
  },

  async markAsRead(id: string): Promise<{ success: boolean; message: string }> {
    return api.put<{ success: boolean; message: string }>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    return api.put<{ success: boolean; message: string }>('/notifications/read-all');
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/notifications/${id}`);
  },
};
