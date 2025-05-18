import '../assets/css/avatar.css';
import { useState } from 'react';

export default function Avatar({name}){
    // const [initials, setInitials] = useState('');

    let initials = localStorage.getItem('Initials') ||'';
    if(name && !initials)
    {
        initials = name
        .split(' ')
        .map(word => word[0].toUpperCase())
        .join('')
        .slice(0, 2);
        localStorage.setItem('Initials', initials);

    }
 
    return <div className="avatar">{initials}</div>;
}