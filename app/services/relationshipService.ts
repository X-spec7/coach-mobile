import { getAuthHeaders } from "./api";
import { API_BASE_URL } from "@/constants/api";

export interface Relationship {
  id: string; // Changed from number to string to support UUIDs
  coach: {
    id: string; // Changed from number to string to support UUIDs
    firstName: string;
    lastName: string;
    fullName: string;
    userType: string;
    email: string;
    address?: string;
    isSuperuser: boolean;
    phoneNumber?: string;
    avatarImageUrl?: string;
    height?: number;
    weight?: number;
    gender: string;
    notificationsEnabled: boolean;
    interests: string[];
    helpCategories: string[];
    selectedMealPlan?: any;
  };
  client: {
    id: string; // Changed from number to string to support UUIDs
    firstName: string;
    lastName: string;
    fullName: string;
    userType: string;
    email: string;
    address?: string;
    isSuperuser: boolean;
    phoneNumber?: string;
    avatarImageUrl?: string;
    height?: number;
    weight?: number;
    gender: string;
    notificationsEnabled: boolean;
    interests: string[];
    helpCategories: string[];
    selectedMealPlan?: any;
  };
  status: "pending" | "active" | "inactive" | "terminated";
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface CreateRelationshipRequest {
  coach_id: string; // Changed from number to string to support UUIDs
  client_id: string; // Changed from number to string to support UUIDs
  status?: string;
  notes?: string;
}

export const RelationshipService = {
  getRelationships: async (
    coachId?: string,
    clientId?: string
  ): Promise<Relationship[]> => {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (coachId) params.append("coach_id", coachId.toString());
      if (clientId) params.append("client_id", clientId.toString());

      console.log("headers:", headers);
      const url = `${API_BASE_URL}/users/relationships/?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch relationships: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Relationships response:", data);

      // Handle the actual backend response structure
      return data.relationships || data.data || [];
    } catch (error) {
      console.error("Error fetching relationships:", error);
      throw error;
    }
  },

  createRelationship: async (
    request: CreateRelationshipRequest
  ): Promise<Relationship> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/relationships`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to create relationship: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Create relationship response:", data);

      // Handle the actual backend response structure
      return data.relationship || data;
    } catch (error) {
      console.error("Error creating relationship:", error);
      throw error;
    }
  },

  updateRelationship: async (
    relationshipId: string, // Changed from number to string
    status: "active" | "inactive" | "terminated",
    notes?: string
  ): Promise<Relationship> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/users/relationships/${relationshipId}`,
        {
          method: "PUT",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, notes }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to update relationship: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Update relationship response:", data);

      return data.relationship || data;
    } catch (error) {
      console.error("Error updating relationship:", error);
      throw error;
    }
  },

  deleteRelationship: async (relationshipId: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/users/relationships/${relationshipId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to delete relationship: ${response.statusText}`
        );
      }

      console.log("Relationship deleted successfully");
    } catch (error) {
      console.error("Error deleting relationship:", error);
      throw error;
    }
  },

  getRelationshipStatus: async (
    coachId: string,
    clientId: string
  ): Promise<Relationship | null> => {
    try {
      const relationships = await RelationshipService.getRelationships(
        coachId,
        clientId
      );

      // Find relationship by comparing nested coach and client IDs
      return (
        relationships.find(
          (rel) => rel.coach.id === coachId && rel.client.id === clientId
        ) || null
      );
    } catch (error) {
      console.error("Error getting relationship status:", error);
      return null;
    }
  },

  myRelationships: async (): Promise<Relationship[]> => {
    try {
      const headers = await getAuthHeaders();
      // Use the existing relationships endpoint without filters to get all relationships
      const response = await fetch(`${API_BASE_URL}/users/my-relationships/`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch my relationships: ${response.statusText}`
        );
      }

      const data = await response.json();

      return data.relationships || data.data || [];
    } catch (error) {
      console.error("Error fetching my relationships:", error);
      throw error;
    }
  },
};
