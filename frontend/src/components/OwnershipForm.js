import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { proposeOwnership, fetchSession } from '../features/sessionSlice';

// Ownership / Song Splits form styled to match other modal forms
// Important: we derive songwriter IDs the same way SessionDetailsV2 does when
// building contributors, so ownership lookup by songwriter id works reliably
// across legacy sessions and the new { user, username } schema.
const OwnershipForm = ({ sessionId, songwriters = [], onClose }) => {
    const [ownership, setOwnership] = useState(
        Array.isArray(songwriters)
            ? songwriters.map((songwriter) => {
                  // Mirror contributors' id resolution logic
                  const userObj =
                      songwriter && typeof songwriter === 'object' && 'user' in songwriter
                          ? songwriter.user
                          : songwriter;
                  const id =
                      (userObj && typeof userObj === 'object' && (userObj._id || userObj.id)) ||
                      songwriter?._id ||
                      songwriter?.id ||
                      songwriter;
                  return { songwriter: id, writing: '', publishing: '' };
              })
            : []
    );
    const dispatch = useDispatch();

    const handleChange = (index, field, value) => {
        const updatedOwnership = [...ownership];
        updatedOwnership[index][field] = value;
        setOwnership(updatedOwnership);
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            // Propose the ownership change instead of committing immediately
            await dispatch(proposeOwnership({ sessionId, ownership })).unwrap();
            try {
                await dispatch(fetchSession(sessionId)).unwrap();
            } catch (fetchErr) {
                console.error('OwnershipForm: fetchSession error after proposal', fetchErr);
            }
            onClose && onClose();
        } catch (err) {
            console.error('OwnershipForm: proposeOwnership error', err);
        }
    };

    return (
        <div className="ownershipModal">
            <h2>Song Splits</h2>
            <p className="helper">Assign writing & publishing percentages to each songwriter.</p>
            <form className="form ownership-form" onSubmit={handleSubmit}>
                {ownership.map((entry, index) => {
                    const sw =
                        songwriters.find((s) => {
                            const userObj =
                                s && typeof s === 'object' && 'user' in s ? s.user : s;
                            const id =
                                (userObj && typeof userObj === 'object' && (userObj._id || userObj.id)) ||
                                s?._id ||
                                s?.id ||
                                s;
                            return String(id) === String(entry.songwriter);
                        }) || {};
                    return (
                        <div key={entry.songwriter} className="ownership-row">
                            <div className="row-head">
                                <div className="songwriter-name">{sw.username || sw.stageName || 'Songwriter'}</div>
                            </div>
                            <div className="pct-pair">
                                <div className="field">
                                    <label className="field-label" htmlFor={`writing-${entry.songwriter}`}>Writing %</label>
                                    <input
                                        id={`writing-${entry.songwriter}`}
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={entry.writing}
                                        onChange={(e) => handleChange(index, 'writing', e.target.value)}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div className="field">
                                    <label className="field-label" htmlFor={`publishing-${entry.songwriter}`}>Publishing %</label>
                                    <input
                                        id={`publishing-${entry.songwriter}`}
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={entry.publishing}
                                        onChange={(e) => handleChange(index, 'publishing', e.target.value)}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className="actions">
                    <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button type="submit" className="action-btn">Update Ownership</button>
                </div>
            </form>
        </div>
    );
};

export default OwnershipForm;
