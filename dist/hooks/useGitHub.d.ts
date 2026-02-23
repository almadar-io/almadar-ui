/**
 * GitHub connection status
 */
export interface GitHubStatus {
    connected: boolean;
    username?: string;
    avatarUrl?: string;
    scopes?: string[];
    connectedAt?: number;
    lastUsedAt?: number;
}
/**
 * GitHub repository
 */
export interface GitHubRepo {
    id: number;
    name: string;
    fullName: string;
    owner: string;
    isPrivate: boolean;
    description: string | null;
    defaultBranch: string;
    url: string;
}
/**
 * Hook to get GitHub connection status
 */
export declare function useGitHubStatus(): import("@tanstack/react-query").UseQueryResult<GitHubStatus, Error>;
/**
 * Hook to connect GitHub (initiate OAuth flow)
 */
export declare function useConnectGitHub(): {
    connectGitHub: () => void;
};
/**
 * Hook to disconnect GitHub
 */
export declare function useDisconnectGitHub(): import("@tanstack/react-query").UseMutationResult<unknown, Error, void, unknown>;
/**
 * Hook to list GitHub repositories
 */
export declare function useGitHubRepos(page?: number, perPage?: number): import("@tanstack/react-query").UseQueryResult<{
    repos: GitHubRepo[];
    page: number;
    perPage: number;
}, Error>;
/**
 * Hook to get repository details
 */
export declare function useGitHubRepo(owner: string, repo: string, enabled?: boolean): import("@tanstack/react-query").UseQueryResult<{
    repo: GitHubRepo;
}, Error>;
/**
 * Hook to list repository branches
 */
export declare function useGitHubBranches(owner: string, repo: string, enabled?: boolean): import("@tanstack/react-query").UseQueryResult<{
    branches: string[];
}, Error>;
