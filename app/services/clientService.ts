import { getAuthHeaders } from "./api";
import { API_BASE_URL } from "@/constants/api";

export interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ClientsResponse {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
}

export interface GetClientsParams {
  search?: string;
}

export interface GetClientsOptions {
  page?: number;
  limit?: number;
}

export class ClientService {
  static async getClients(
    params: GetClientsParams = {},
    options: GetClientsOptions = { page: 1, limit: 50 }
  ): Promise<ClientsResponse> {
    try {
      const headers = await getAuthHeaders();

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.search) {
        queryParams.append("search", params.search);
      }
      if (options.page) {
        queryParams.append("page", options.page.toString());
      }
      if (options.limit) {
        queryParams.append("limit", options.limit.toString());
      }

      // Build the backend URL with query parameters
      let backendUrl = `${API_BASE_URL}/users/?user_type=Client`;

      // Add pagination parameters
      backendUrl += `&page=${options.page}&limit=${options.limit}`;

      // Add search parameter if provided
      if (params.search) {
        backendUrl += `&search=${encodeURIComponent(params.search)}`;
      }

      const response = await fetch(backendUrl, {
        headers,
      });

      console.log("response", response);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required");
        }
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch clients: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("clients data", data);

      // Transform the API response to match our interface
      const clients: Client[] = data.users.map((user: any) => ({
        id: user.id.toString(),
        name: user.fullName || `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: user.avatarImageUrl,
      }));

      console.log("clients>>", clients);
      return {
        clients,
        total: clients.length,
        page: options.page || 1,
        limit: options.limit || 50,
      };
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  }
}
