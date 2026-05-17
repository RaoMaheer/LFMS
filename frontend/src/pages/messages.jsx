import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  MessageSquare, Send, Search,
  User, Clock
} from 'lucide-react';

const BASE = 'http://localhost:5000/api/law';

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ── component ────────────────────────────────────────────────────────────────

const Messages = () => {
  const { user, role } = useSelector((s) => s.auth);

  const [lawyers,      setLawyers]      = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [newMsg,       setNewMsg]       = useState('');
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(false);

  const bottomRef  = useRef(null);
  const pollRef    = useRef(null);

  // my ID — admin uses 0, lawyer uses their lawyer_id
  const myId = role === 'admin' ? 0 : user?.id;

  // fetch all lawyers for contact list
  useEffect(() => {
    fetch(`${BASE}/messages/lawyers-list`)
      .then(r => r.json())
      .then(data => setLawyers(data))
      .catch(console.error);
  }, []);

  // fetch messages when a contact is selected
  useEffect(() => {
    if (!selectedUser) return;
    fetchMessages();

    // poll every 3 seconds for new messages
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [selectedUser]);

  // scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/messages/${myId}/${selectedUser.lawyer_id}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedUser) return;
    try {
      await fetch(`${BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id:   myId,
          receiver_id: selectedUser.lawyer_id,
          message:     newMsg.trim(),
        }),
      });
      setNewMsg('');
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredLawyers = lawyers.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  // group messages by date for display
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = fmtDate(msg.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div
      className="text-white d-flex"
      style={{ background: '#0b1220', height: '100vh', overflow: 'hidden' }}
    >

      {/* ── LEFT: CONTACTS PANEL ──────────────────────────────── */}
      <div
        className="d-flex flex-column flex-shrink-0"
        style={{
          width: '280px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.01)'
        }}
      >
        {/* PANEL HEADER */}
        <div className="p-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}>
              <MessageSquare size={18} className="text-warning" />
            </div>
            <h6 className="fw-bold mb-0">Messages</h6>
          </div>

          {/* SEARCH */}
          <div
            className="d-flex align-items-center px-3 py-2 rounded-pill"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Search size={13} className="text-white-50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lawyers..."
              className="form-control bg-transparent border-0 text-white shadow-none ms-2 p-0"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* CONTACTS LIST */}
        <div className="flex-grow-1 overflow-y-auto py-2">
          {filteredLawyers.map((lawyer) => {
            const isMe     = role === 'lawyer' && lawyer.lawyer_id === myId;
            const isActive = selectedUser?.lawyer_id === lawyer.lawyer_id;
            if (isMe) return null; // don't show yourself

            return (
              <div
                key={lawyer.lawyer_id}
                onClick={() => { setSelectedUser(lawyer); setMessages([]); }}
                className="d-flex align-items-center gap-3 px-3 py-3 cursor-pointer"
                style={{
                  background: isActive ? 'rgba(251,191,36,0.08)' : 'transparent',
                  borderLeft: isActive ? '3px solid #fbbf24' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                  style={{
                    width: 40, height: 40,
                    background: isActive ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.6)',
                    fontSize: '15px'
                  }}
                >
                  {lawyer.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="fw-semibold small text-white text-truncate">{lawyer.name}</div>
                  <div className="text-white-50" style={{ fontSize: '11px' }}>{lawyer.specialization}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: CHAT PANEL ────────────────────────────────── */}
      <div className="d-flex flex-column flex-grow-1" style={{ overflow: 'hidden' }}>

        {selectedUser ? (
          <>
            {/* CHAT HEADER */}
            <div
              className="d-flex align-items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{ width: 42, height: 42, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: '16px' }}
              >
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <div className="fw-bold">{selectedUser.name}</div>
                <div className="text-white-50" style={{ fontSize: '12px' }}>{selectedUser.specialization}</div>
              </div>
              <div className="ms-auto d-flex align-items-center gap-2">
                <div
                  className="rounded-pill px-3 py-1"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: '11px', fontWeight: 600 }}
                >
                  ● Online
                </div>
              </div>
            </div>

            {/* MESSAGES AREA */}
            <div
              className="flex-grow-1 px-4 py-3 overflow-y-auto"
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  {/* DATE DIVIDER */}
                  <div className="d-flex align-items-center gap-3 my-3">
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                    <span className="text-white-50" style={{ fontSize: '11px' }}>{date}</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                  </div>

                  {msgs.map((msg) => {
                    const isMine = String(msg.sender_id) === String(myId);
                    return (
                      <div
                        key={msg.message_id}
                        className="d-flex mb-2"
                        style={{ justifyContent: isMine ? 'flex-end' : 'flex-start' }}
                      >
                        {/* AVATAR for received */}
                        {!isMine && (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 me-2"
                            style={{
                              width: 32, height: 32, alignSelf: 'flex-end',
                              background: 'rgba(255,255,255,0.06)',
                              color: 'rgba(255,255,255,0.6)', fontSize: '13px'
                            }}
                          >
                            {msg.sender_name?.charAt(0)}
                          </div>
                        )}

                        <div style={{ maxWidth: '65%' }}>
                          {/* BUBBLE */}
                          <div
                            className="px-3 py-2 rounded-4"
                            style={{
                              background: isMine
                                ? 'rgba(251,191,36,0.15)'
                                : 'rgba(255,255,255,0.06)',
                              border: isMine
                                ? '1px solid rgba(251,191,36,0.2)'
                                : '1px solid rgba(255,255,255,0.08)',
                              borderBottomRightRadius: isMine ? '4px' : '16px',
                              borderBottomLeftRadius:  isMine ? '16px' : '4px',
                              color: isMine ? '#fef3c7' : 'rgba(255,255,255,0.9)',
                              fontSize: '14px',
                              lineHeight: 1.5,
                              wordBreak: 'break-word'
                            }}
                          >
                            {msg.message}
                          </div>
                          {/* TIMESTAMP */}
                          <div
                            className="mt-1"
                            style={{
                              fontSize: '10px',
                              color: 'rgba(255,255,255,0.3)',
                              textAlign: isMine ? 'right' : 'left',
                              paddingLeft: isMine ? 0 : '4px',
                              paddingRight: isMine ? '4px' : 0
                            }}
                          >
                            {fmtTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {messages.length === 0 && !loading && (
                <div className="text-center text-white-50 my-auto" style={{ fontSize: '14px' }}>
                  No messages yet. Say hello! 👋
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT BAR */}
            <div
              className="px-4 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
            >
              <div
                className="d-flex align-items-end gap-3 rounded-4 px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <textarea
                  rows={1}
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedUser.name}...`}
                  className="form-control bg-transparent border-0 text-white shadow-none p-0 flex-grow-1"
                  style={{
                    resize: 'none', fontSize: '14px',
                    maxHeight: '100px', overflowY: 'auto',
                    lineHeight: 1.5
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!newMsg.trim()}
                  className="btn rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: 40, height: 40, padding: 0,
                    background: newMsg.trim() ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                    color:      newMsg.trim() ? '#0b1220' : 'rgba(255,255,255,0.3)',
                    border: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="text-white-50 mt-2" style={{ fontSize: '11px', paddingLeft: '4px' }}>
                Press Enter to send · Shift+Enter for new line
              </div>
            </div>
          </>
        ) : (
          /* EMPTY STATE */
          <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center">
            <div className="p-4 rounded-4 mb-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <MessageSquare size={48} className="text-warning" />
            </div>
            <h5 className="fw-bold mb-2">Internal Messaging</h5>
            <p className="text-white-50 small" style={{ maxWidth: '280px' }}>
              Select a lawyer from the left panel to start a confidential conversation.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .overflow-y-auto { overflow-y: auto; }
        .form-control:focus { box-shadow: none !important; }
        .form-control::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default Messages;