const GITHUB_API_BASE = 'https://api.github.com';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

export class GitHubAPI {
  constructor(owner, repo, token) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
    this.timeout = DEFAULT_TIMEOUT;
    this.maxRetries = MAX_RETRIES;
  }

  // Create fetch request with timeout
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout after ${this.timeout / 1000} seconds`);
        timeoutError.name = 'TimeoutError';
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network request failed. Please check your internet connection.');
        networkError.name = 'NetworkError';
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      }
      throw error;
    }
  }

  // Enhanced error handling for GitHub API responses
  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage;
      let errorData;

      try {
        errorData = await response.json();
        errorMessage = errorData.message || response.statusText;
      } catch {
        errorMessage = response.statusText || 'Unknown error';
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = errorData;

      // Add specific error types based on status codes
      switch (response.status) {
        case 401:
          error.type = 'AUTHENTICATION_ERROR';
          break;
        case 403:
          error.type = errorMessage?.toLowerCase().includes('rate limit') 
            ? 'RATE_LIMIT_ERROR' 
            : 'PERMISSION_ERROR';
          break;
        case 404:
          error.type = 'NOT_FOUND_ERROR';
          break;
        case 422:
          error.type = 'VALIDATION_ERROR';
          break;
        case 500:
        case 502:
        case 503:
          error.type = 'SERVER_ERROR';
          break;
        default:
          error.type = 'API_ERROR';
      }

      throw error;
    }

    return response;
  }

  // Retry logic for transient failures
  async withRetry(operation, context = '') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain error types
        if (error.status && [400, 401, 403, 404, 422].includes(error.status)) {
          throw error;
        }

        // Don't retry on authentication or permission errors
        if (error.type && ['AUTHENTICATION_ERROR', 'PERMISSION_ERROR'].includes(error.type)) {
          throw error;
        }

        if (attempt === this.maxRetries) {
          console.error(`${context}: Failed after ${this.maxRetries} attempts:`, error);
          throw error;
        }

        // Exponential backoff with jitter
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.warn(`${context}: Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  async testConnection() {
    try {
      const result = await this.withRetry(async () => {
        const response = await this.fetchWithTimeout(`${GITHUB_API_BASE}/repos/${this.owner}/${this.repo}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        const validResponse = await this.handleResponse(response);
        const repoData = await validResponse.json();

        return {
          name: repoData.name,
          fullName: repoData.full_name,
          private: repoData.private,
          permissions: repoData.permissions,
          hasWriteAccess: repoData.permissions?.push || false
        };
      }, 'GitHub Connection Test');

      return {
        success: true,
        repository: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.type || 'UNKNOWN_ERROR',
        status: error.status
      };
    }
  }

  async fetchData(fileName = 'data.json') {
    try {
      const result = await this.withRetry(async () => {
        const response = await this.fetchWithTimeout(`${GITHUB_API_BASE}/repos/${this.owner}/${this.repo}/contents/${fileName}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        if (response.status === 404) {
          // File doesn't exist, return complete empty data structure
          return {
            data: {
              metadata: {
                version: "1.0.0",
                lastUpdated: new Date().toISOString(),
                nextIds: {
                  product: 1,
                  container: 1,
                  sale: 1,
                  expense: 1,
                  partner: 1,
                  withdrawal: 1,
                  cashFlow: 1,
                  cashInjection: 1,
                }
              },
              containers: [],
              products: [],
              sales: [],
              expenses: [],
              partners: [],
              withdrawals: [],
              cashFlows: [],
              cashInjections: []
            },
            sha: null,
            isNewFile: true
          };
        }

        const validResponse = await this.handleResponse(response);
        const fileData = await validResponse.json();

        let data;
        try {
          const content = atob(fileData.content);

          // Handle empty or whitespace-only content
          if (!content || content.trim() === '') {
            console.warn('GitHub file is empty, returning empty data structure');
            return {
              data: {
                metadata: {
                  version: "1.0.0",
                  lastUpdated: new Date().toISOString(),
                  nextIds: {
                    product: 1,
                    container: 1,
                    sale: 1,
                    expense: 1,
                    partner: 1,
                    withdrawal: 1,
                    cashFlow: 1,
                    cashInjection: 1,
                  }
                },
                containers: [],
                products: [],
                sales: [],
                expenses: [],
                partners: [],
                withdrawals: [],
                cashFlows: [],
                cashInjections: []
              },
              sha: fileData.sha,
              isNewFile: false,
              wasEmpty: true
            };
          }

          data = JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse GitHub data file:', parseError.message);
          // Return the SHA so we can overwrite the corrupted file
          throw new Error(`Failed to parse data file: ${parseError.message}. SHA: ${fileData.sha}`);
        }

        return {
          data,
          sha: fileData.sha,
          isNewFile: false
        };
      }, 'Fetch Data');

      return {
        success: true,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.type || 'UNKNOWN_ERROR',
        status: error.status
      };
    }
  }

  async updateData(fileName = 'data.json', data, commitMessage = 'Update data', providedSha = null, forceOverwrite = false) {
    try {
      console.log(`GitHub API: Attempting to ${forceOverwrite ? 'force overwrite' : 'update'} ${fileName} in ${this.owner}/${this.repo}`);

      const result = await this.withRetry(async () => {
        // Use provided SHA or fetch the current one
        let sha = providedSha;

        // Always fetch the latest SHA to avoid conflicts (unless force overwrite)
        if (!forceOverwrite) {
          try {
            const currentFileResponse = await this.fetchWithTimeout(`${GITHUB_API_BASE}/repos/${this.owner}/${this.repo}/contents/${fileName}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28'
              }
            });

            if (currentFileResponse.ok) {
              const currentFile = await currentFileResponse.json();
              sha = currentFile.sha; // Always use the latest SHA
              console.log(`GitHub API: Found existing file with SHA: ${sha}`);
            }
          } catch (error) {
            if (error.status !== 404) {
              throw error; // Re-throw non-404 errors
            }
            console.log(`GitHub API: File doesn't exist yet, creating new file`);
            sha = null;
          }
        } else {
          // For force overwrite, fetch SHA but don't fail if content is bad
          try {
            const currentFileResponse = await this.fetchWithTimeout(`${GITHUB_API_BASE}/repos/${this.owner}/${this.repo}/contents/${fileName}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28'
              }
            });

            if (currentFileResponse.ok) {
              const currentFile = await currentFileResponse.json();
              sha = currentFile.sha;
              console.log(`GitHub API: Force overwrite - using SHA: ${sha}`);
            }
          } catch (error) {
            console.log(`GitHub API: Force overwrite - could not fetch SHA, will create new file`);
            sha = null;
          }
        }

        // Validate data before encoding
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data: must be a valid object');
        }

        // Update metadata
        const updatedData = {
          ...data,
          metadata: {
            ...data.metadata,
            version: data.metadata?.version || "1.0.0",
            lastUpdated: new Date().toISOString()
          }
        };

        // Validate data structure - ensure all required arrays exist
        const requiredArrays = ['containers', 'products', 'sales', 'expenses', 'partners', 'withdrawals', 'cashFlows', 'cashInjections'];
        for (const field of requiredArrays) {
          if (!Array.isArray(updatedData[field])) {
            updatedData[field] = [];
          }
        }

        let content;
        try {
          content = btoa(JSON.stringify(updatedData, null, 2));
        } catch (encodeError) {
          throw new Error(`Failed to encode data: ${encodeError.message}`);
        }

        const updatePayload = {
          message: commitMessage || `Update ${fileName}`,
          content: content
        };

        // Include SHA if file exists
        if (sha) {
          updatePayload.sha = sha;
        }

        console.log('GitHub API: Sending PUT request');
        
        const response = await this.fetchWithTimeout(`${GITHUB_API_BASE}/repos/${this.owner}/${this.repo}/contents/${fileName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });

        const validResponse = await this.handleResponse(response);
        const result = await validResponse.json();
        
        console.log('GitHub API: Successfully updated file');
        
        return {
          sha: result.content.sha, // This is the new file SHA
          commitSha: result.commit.sha,
          message: result.commit.message,
          url: result.commit.html_url
        };
      }, 'Update Data');

      return {
        success: true,
        commit: result
      };
    } catch (error) {
      console.error('GitHub API: Update failed:', error);
      return {
        success: false,
        error: error.message,
        errorType: error.type || 'UNKNOWN_ERROR',
        status: error.status
      };
    }
  }

  async createFile(fileName, data, commitMessage = 'Create data file') {
    try {
      const initialData = {
        metadata: {
          version: "1.0.0",
          lastUpdated: new Date().toISOString(),
          nextIds: {
            product: 1,
            container: 1,
            sale: 1,
            expense: 1,
            partner: 1,
            withdrawal: 1,
            cashFlow: 1,
            cashInjection: 1,
          }
        },
        containers: [],
        products: [],
        sales: [],
        expenses: [],
        partners: [],
        withdrawals: [],
        cashFlows: [],
        cashInjections: [],
        ...data
      };

      const content = btoa(JSON.stringify(initialData, null, 2));

      const response = await fetch(`${GITHUB_API_BASE}/repos/${this.owner}/${this.repo}/contents/${fileName}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: content
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create file: ${response.status} ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        commit: {
          sha: result.commit.sha,
          message: result.commit.message
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Rate limit check
  async getRateLimit() {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get rate limit: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Helper functions
export async function testGitHubConnection(owner, repo, token) {
  const api = new GitHubAPI(owner, repo, token);
  return await api.testConnection();
}

export async function fetchGitHubData(owner, repo, token, fileName = 'data.json') {
  const api = new GitHubAPI(owner, repo, token);
  return await api.fetchData(fileName);
}

export async function updateGitHubData(owner, repo, token, fileName = 'data.json', data, commitMessage, sha = null, forceOverwrite = false) {
  const api = new GitHubAPI(owner, repo, token);
  return await api.updateData(fileName, data, commitMessage, sha, forceOverwrite);
}