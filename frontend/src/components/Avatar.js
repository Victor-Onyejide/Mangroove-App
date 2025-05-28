import '../assets/css/avatar.css';

export default function Avatar({ name }) {
    const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Retrieve initials and expiration from localStorage
    const storedData = JSON.parse(localStorage.getItem('Initials')) || {};
    let initials = storedData.value || '';
    const expiration = storedData.expiration || 0;

    // Check if the stored initials have expired
    const now = Date.now();
    if (now > expiration) {
        // Clear expired initials
        localStorage.removeItem('Initials');
        initials = '';
    }

    // Generate and store initials if not already set or expired
    if (name && !initials) {
        initials = name
            .split(' ')
            .map(word => word[0].toUpperCase())
            .join('')
            .slice(0, 2);

        const newExpiration = now + EXPIRATION_TIME; // Set expiration time
        localStorage.setItem(
            'Initials',
            JSON.stringify({ value: initials, expiration: newExpiration })
        );
    }

    return <div className="avatar">{initials}</div>;
}