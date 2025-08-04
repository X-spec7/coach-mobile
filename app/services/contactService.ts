import { getAuthHeaders } from "./api";
import { API_BASE_URL } from "@/constants/api";

export interface IContact {
  id: number;
  fullName: string;
  userType: string;
  avatarUrl?: string | null;
  unreadCount: number;
  lastMessage?: {
    content: string;
    sentDate: string;
  };
}

export interface ContactsResponse {
  contacts: IContact[];
}

export const ContactService = {
  getContacts: async (): Promise<ContactsResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/chat/contacts/`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Contacts response:", data);

      return data.contacts || data.data || { contacts: [] };
    } catch (error) {
      console.error("Error fetching contacts:", error);
      // Return empty contacts on error
      return { contacts: [] };
    }
  },
};
