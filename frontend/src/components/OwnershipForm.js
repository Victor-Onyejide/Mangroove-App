import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateOwnership, fetchSession } from '../features/sessionSlice';


const OwnershipForm = ({ sessionId, songwriters, onClose }) => {
    const [ownership, setOwnership] = useState(
                songwriters.map(songwriter => ({ songwriter: songwriter._id, writing: '', publishing: '' }))
        );
        const dispatch = useDispatch();

        const handleChange = (index, field, value) => {
                const updatedOwnership = [...ownership];
                updatedOwnership[index][field] = value;
                setOwnership(updatedOwnership);
        };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        console.log('OwnershipForm: handleSubmit called', { sessionId, ownership });
        try {
            // use unwrap to throw on rejected action
            const result = await dispatch(updateOwnership({ sessionId, ownership })).unwrap();
            console.log('OwnershipForm: updateOwnership result', result);
            // Re-fetch the session so we get the populated songwriter objects (server may return ids)
            try {
                await dispatch(fetchSession(sessionId)).unwrap();
                console.log('OwnershipForm: fetchSession completed after update');
            } catch (fetchErr) {
                console.error('OwnershipForm: fetchSession error after update', fetchErr);
            }
            if (onClose) {
                console.log('OwnershipForm: calling onClose to close modal');
                onClose();
            }
        } catch (err) {
            console.error('OwnershipForm: updateOwnership error', err);
        }
    };

        return (
                <form onSubmit={handleSubmit}>
                    <h2>Enter Songwriter Ownership </h2>
                    {ownership.map((entry, index) => (
                        <div key={entry.songwriter} style={{ display: 'flex',  flexDirection: 'column',gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <input
                                type="text"
                                placeholder="Songwriter Name"
                                value={songwriters.find(sw => sw._id === entry.songwriter).username}
                                readOnly
                                style={{ flex: 1, minWidth: '180px' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                    type="number"
                                    placeholder="Writing %"
                                    value={entry.writing}
                                    onChange={(e) => handleChange(index, 'writing', e.target.value)}
                                    min="0"
                                    max="100"
                                    style={{ width: '160px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'textfield' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Publishing %"
                                    value={entry.publishing}
                                    onChange={(e) => handleChange(index, 'publishing', e.target.value)}
                                    min="0"
                                    max="100"
                                    style={{ width: '160px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'textfield' }}
                                />
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleSubmit} style={{ padding: '8px 16px', borderRadius: '6px', background: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold' }}>
                        Update Ownership
                    </button>
                </form>
        );
        // Publishing, Writing
};

export default OwnershipForm;
