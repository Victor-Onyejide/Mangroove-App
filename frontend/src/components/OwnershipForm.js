import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateOwnership } from '../features/sessionSlice';

const OwnershipForm = ({ sessionId, songwriters }) => {
    const [ownership, setOwnership] = useState(
        songwriters.map(songwriter => ({ songwriter: songwriter._id, percentage: 0 }))
    );
    const dispatch = useDispatch();

    const handleChange = (index, field, value) => {
        const updatedOwnership = [...ownership];
        updatedOwnership[index][field] = value;
        setOwnership(updatedOwnership);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateOwnership({ sessionId, ownership }));
    };

    return (
        <form onSubmit={handleSubmit}>
            <table>
                <thead>
                    <tr>
                        <th>Songwriter</th>
                        <th>Ownership (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {ownership.map((entry, index) => (
                        <tr key={entry.songwriter}>
                            <td>{songwriters.find(sw => sw._id === entry.songwriter).name}</td>
                            <td>
                                <input
                                    type="number"
                                    value={entry.percentage}
                                    onChange={(e) => handleChange(index, 'percentage', e.target.value)}
                                    min="0"
                                    max="100"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button type="submit">Update Ownership</button>
        </form>
    );
};

export default OwnershipForm;
