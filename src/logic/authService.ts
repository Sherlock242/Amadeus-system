
import type { UserProfile } from '@/types';

// Hardcoded Admin/Creator Credentials
const ADMIN_USER = 'ferris';
const ADMIN_PASS = 'kgıqwcn92137gfjtıwerv7cx12306n';

export const login = async (username: string, password: string): Promise<UserProfile> => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        return {
            name: ADMIN_USER,
            email: 'creator@amadeus.project',
            picture: `https://picsum.photos/seed/ferris/200/200`,
        };
    }
    return {
        name: username,
        email: `${username.toLowerCase()}@fg.lab`,
        picture: `https://picsum.photos/seed/${username}/200/200`,
    };
};

export const register = async (username: string, password: string): Promise<UserProfile> => {
    return {
        name: username,
        email: `${username.toLowerCase()}@fg.lab`,
        picture: `https://picsum.photos/seed/${username}/200/200`,
    };
};
