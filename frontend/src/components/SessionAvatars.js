
import '../assets/css/sessionAvatars.css';

export default function SessionAvatars({ initialUsers = [], onAvatarClick }) {
    // Generate initials for a user
    const generateInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .map(word => word[0].toUpperCase())
            .join('')
            .slice(0, 2);
    };

    return (
        <div className="session-avatars-container">
            {initialUsers.map((user) => (
                <div
                    key={user._id}
                    className="avatar-large"
                    onClick={() => onAvatarClick && onAvatarClick(user)}
                    style={{ cursor: 'pointer' }}
                >
                    {generateInitials(user.username)} {/* Assuming user has a `username` field */}
                </div>
            ))}
        </div>
    );
}