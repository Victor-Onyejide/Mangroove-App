import React, { useState } from 'react';
import Modal from './Modal';
import { useDispatch } from 'react-redux';
import { respondOwnership, fetchSession } from '../features/sessionSlice';
import { toast } from 'react-toastify';
import './modal.css';

const OwnershipProposalModal = ({ sessionId, proposalId, proposal, proposedBy, songwriters = [], onClose }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleRespond = async (accept) => {
        setLoading(true);
        try {
            await dispatch(respondOwnership({ sessionId, proposalId, accept })).unwrap();
            // Refresh session after responding to update UI
            await dispatch(fetchSession(sessionId)).unwrap();
            // Give participant feedback
            if (accept) toast.success('You accepted the split proposal');
            else toast.error('You rejected the split proposal');
        } catch (err) {
            console.error('Respond error', err);
        } finally {
            setLoading(false);
            onClose && onClose();
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="ownershipModal">
                <h2>Ownership Proposal</h2>
                <p className="helper">A new split proposal has been proposed. Please accept to confirm these percentages.</p>
                <div className="proposal-list">
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                            <tr>
                                <th style={{textAlign:'left'}}>Songwriter</th>
                                <th style={{width:120}}>Writing %</th>
                                <th style={{width:120}}>Publishing %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposal.map((p) => {
                                const sw = songwriters.find(s => {
                                    const userObj = s && typeof s === 'object' && 'user' in s ? s.user : s;
                                    const id = (userObj && (userObj._id || userObj.id)) || s?._id || s?.id || s;
                                    return String(id) === String(p.songwriter);
                                }) || {};
                                return (
                                    <tr key={String(p.songwriter)}>
                                        <td style={{padding:'8px 4px'}} data-label="Songwriter">{(sw.username || sw.stageName || sw._id || 'User')}</td>
                                        <td style={{padding:'8px 4px', textAlign:'center'}} data-label="Writing">{p.writing}%</td>
                                        <td style={{padding:'8px 4px', textAlign:'center'}} data-label="Publishing">{p.publishing}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="actions" style={{marginTop:16, display:'flex', gap:12, justifyContent:'flex-end'}}>
                    <button className="cancel-btn" type="button" onClick={() => handleRespond(false)} disabled={loading}>Reject</button>
                    <button className="action-btn" type="button" onClick={() => handleRespond(true)} disabled={loading}>Accept</button>
                </div>
            </div>
        </Modal>
    );
};

export default OwnershipProposalModal;
