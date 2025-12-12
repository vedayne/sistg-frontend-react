import { useCallback, useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import type { UserBasicInfo, UserFilters, Pagination, PaginatedResponse } from "@/lib/types"

/**
 * Interface for the error state following the Result pattern
 */
interface UsersError {
  message: string
  code?: string
  details?: unknown
}

/**
 * State interface for the hook
 */
interface UsersState {
  users: UserBasicInfo[]
  pagination: Pagination | null
  loading: boolean
  error: UsersError | null
}

/**
 * Return type for the hook following Interface Segregation Principle
 */
interface UseUsersReturn extends UsersState {
  fetchUsers: (filters: Partial<UserFilters>) => Promise<void>
  refetch: () => Promise<void>
  clearError: () => void
}

/**
 * Custom hook for managing users list with filters
 * Follows Single Responsibility Principle - only handles user list logic
 *
 * @param initialFilters - Initial filters to apply
 * @returns Users state and actions
 */
export function useUsers(initialFilters?: Partial<UserFilters>): UseUsersReturn {
  const [state, setState] = useState<UsersState>({
    users: [],
    pagination: null,
    loading: false,
    error: null,
  })

  const [currentFilters, setCurrentFilters] = useState<Partial<UserFilters>>(
    initialFilters || { page: 1, limit: 10 }
  )

  /**
   * Fetches users from API with given filters
   * Implements error handling and loading states
   */
  const fetchUsers = useCallback(async (filters: Partial<UserFilters>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    setCurrentFilters(filters)

    try {
      const response: PaginatedResponse<UserBasicInfo> = await apiClient.users.list({
        page: filters.page || 1,
        limit: filters.limit || 10,
        search: filters.search || undefined,
        status: filters.status || undefined,
        role: filters.role || undefined,
        sortBy: filters.sortBy || "createdAt",
        sortOrder: filters.sortOrder || "desc",
        fields: filters.fields || undefined,
      })

      setState({
        users: response.data,
        pagination: response.pagination,
        loading: false,
        error: null,
      })
    } catch (err) {
      const error: UsersError = {
        message: err instanceof Error ? err.message : "No se pudieron cargar los usuarios",
        code: "FETCH_USERS_ERROR",
        details: err,
      }

      setState({
        users: [],
        pagination: null,
        loading: false,
        error,
      })
    }
  }, [])

  /**
   * Refetches users with current filters
   */
  const refetch = useCallback(() => {
    return fetchUsers(currentFilters)
  }, [currentFilters, fetchUsers])

  /**
   * Clears the error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    if (initialFilters) {
      fetchUsers(initialFilters)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    fetchUsers,
    refetch,
    clearError,
  }
}
