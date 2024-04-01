// services/apiService.ts

const API_BASE_URL = 'http://localhost:3000'; // Change this to match your API URL

export async function createWinner(playerName: string, score: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/winners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName, score }),
    });

    if (!response.ok) {
      throw new Error('Failed to create winner');
    }
  } catch (error) {
    console.error('Error creating winner:', error);
    throw error;
  }
}

export async function getLeaderboard(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/winners/leaderboard`);
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}
