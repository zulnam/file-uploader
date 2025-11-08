import axios, { type AxiosResponse } from 'axios';

export interface getFilesResponse {
    files: { name: string; size: number }[];
}

export const getFiles = async (): Promise<{ name: string; size: number }[]> => {
    const response = await axios
        .get('/api/files')
        .then((response: AxiosResponse<getFilesResponse>) => response.data)
        .catch((error) => {
            // ideally this would be logged to a error tracking service like Sentry or Rollbar
            // but for the purpose of this demo, we'll just log it to the console
            console.error('Error fetching files:', error);
            throw error;
        });
    return response.files;
};
