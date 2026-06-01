import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Send, Search, Bell, BellOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BASE = 'https://lfms-backend-dgpk.onrender.com/api/law';
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const Messages = () => {
  const { user, role } = useSelector((s) => s.auth);
  const { isDark } = useTheme();

  const bg          = isDark ? '#0b1220'                : '#f1f5f9';
  const panelBg     = isDark ? 'rgba(255,255,255,0.01)' : '#ffffff';
  const panelBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textMain    = isDark ? 'white'                  : '#1e293b';
  const textSub     = isDark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.45)';
  const inputBg     = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const msgInBg     = isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0';
  const msgInBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inputBarBg  = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const inputBarBdr = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const timeColor   = isDark ? 'rgba(255,255,255,0.3)'  : 'rgba(0,0,0,0.3)';
  const dividerBg   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const activeItem  = isDark ? 'rgba(251,191,36,0.08)'  : 'rgba(251,191,36,0.06)';

  const [lawyers,         setLawyers]         = useState([]);
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [messages,        setMessages]        = useState([]);
  const [newMsg,          setNewMsg]          = useState('');
  const [search,          setSearch]          = useState('');
  const [loading,         setLoading]         = useState(false);
  const [unreadCounts,    setUnreadCounts]    = useState({});
  const [lastMessageTime, setLastMessageTime] = useState({});
  const [notification,    setNotification]    = useState(null);
  const [notifSound,      setNotifSound]      = useState(true);

  const bottomRef       = useRef(null);
  const pollRef         = useRef(null);
  const audioRef        = useRef(null);
  // stores the created_at of last message seen per lawyer BEFORE opening chat
  const lastSeenRef     = useRef({});
  // stores the timestamp when i opened/read a conversation
  const lastReadRef     = useRef({});
  // ref mirror of selectedUser so interval callbacks can read current value
  const selectedUserRef = useRef(null);

  const myId = role === 'admin' ? 0 : user?.id;

  // fetch lawyers list on mount — snapshot lastSeenRef so we know what was "already there"
  useEffect(() => {
    const init = async () => {
      try {
        const res  = await fetch(`${BASE}/messages/lawyers-list`);
        const data = await res.json();
        setLawyers(data);

        // snapshot: for each lawyer, record the latest message time as "already seen"
        for (const lawyer of data) {
          if (lawyer.lawyer_id === myId) continue;
          try {
            const r    = await fetch(`${BASE}/messages/${myId}/${lawyer.lawyer_id}`);
            const msgs = await r.json();
            if (msgs.length > 0) {
              lastSeenRef.current[lawyer.lawyer_id] = msgs[msgs.length - 1].created_at;
            }
          } catch {}
        }
      } catch (err) { console.error(err); }
    };
    init();
  }, [myId]);

  // keep selectedUserRef in sync
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // poll open conversation
  useEffect(() => {
    if (!selectedUser) return;
    const poll = async () => {
      try {
        const res  = await fetch(`${BASE}/messages/${myId}/${selectedUser.lawyer_id}`);
        const data = await res.json();
        setMessages(data);
        if (data.length > 0) {
          setLastMessageTime(prev => ({ ...prev, [selectedUser.lawyer_id]: data[data.length - 1].created_at }));
        }
      } catch (err) { console.error(err); }
    };
    poll();
    markAsRead(selectedUser.lawyer_id);
    pollRef.current = setInterval(poll, 2000);
    return () => clearInterval(pollRef.current);
  }, [selectedUser, myId]);

  // scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // background polling — unread counts + notifications
  useEffect(() => {
    const check = async () => {
      try {
        const res         = await fetch(`${BASE}/messages/lawyers-list`);
        const lawyersList = await res.json();

        const newUnread          = {};
        const newLastMessageTime = {};

        for (const lawyer of lawyersList) {
          if (lawyer.lawyer_id === myId) continue;

          const r       = await fetch(`${BASE}/messages/${myId}/${lawyer.lawyer_id}`);
          const msgData = await r.json();

          if (msgData.length === 0) continue;

          const lastMsg = msgData[msgData.length - 1];
          newLastMessageTime[lawyer.lawyer_id] = lastMsg.created_at;

          // ── unread count ──────────────────────────────────────────────────
          // messages FROM them that arrived after i last opened the chat
          const openedAt = lastReadRef.current[lawyer.lawyer_id]
            ? new Date(lastReadRef.current[lawyer.lawyer_id])
            : null;

          const fromThem = msgData.filter(
            m => String(m.sender_id) === String(lawyer.lawyer_id)
          );

          if (openedAt) {
            const unread = fromThem.filter(m => new Date(m.created_at) > openedAt);
            if (unread.length > 0) newUnread[lawyer.lawyer_id] = unread.length;
          } else {
            // never opened — all their messages are unread
            if (fromThem.length > 0) newUnread[lawyer.lawyer_id] = fromThem.length;
          }

          // ── notification ─────────────────────────────────────────────────
          // fire if the very last message is FROM them AND newer than lastSeen
          const lastSeen = lastSeenRef.current[lawyer.lawyer_id];
          const currentlyOpen =
            selectedUserRef.current?.lawyer_id === lawyer.lawyer_id;

          const isNewMsg =
            String(lastMsg.sender_id) === String(lawyer.lawyer_id) &&
            (!lastSeen || new Date(lastMsg.created_at) > new Date(lastSeen));

          if (isNewMsg && !currentlyOpen) {
            showNotification(lawyer, lastMsg);
          }

          // update lastSeen to prevent re-firing same message
          lastSeenRef.current[lawyer.lawyer_id] = lastMsg.created_at;
        }

        setUnreadCounts(newUnread);
        setLastMessageTime(prev => ({ ...prev, ...newLastMessageTime }));
      } catch (err) { console.error(err); }
    };

    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, [myId]);

  const showNotification = (lawyer, message) => {
    setNotification({
      from:     lawyer.name,
      message:  message.message.substring(0, 60) + (message.message.length > 60 ? '...' : ''),
      lawyerId: lawyer.lawyer_id,
    });
    if (notifSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    setTimeout(() => setNotification(null), 5000);
  };

  const markAsRead = (lawyerId) => {
    // record NOW as the "last opened" time so future messages are counted from here
    lastReadRef.current[lawyerId]  = new Date().toISOString();
    lastSeenRef.current[lawyerId]  = new Date().toISOString();
    setUnreadCounts(prev => { const u = { ...prev }; delete u[lawyerId]; return u; });
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedUser) return;
    try {
      await fetch(`${BASE}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sender_id: myId, receiver_id: selectedUser.lawyer_id, message: newMsg.trim() }),
      });
      setNewMsg('');
      const res  = await fetch(`${BASE}/messages/${myId}/${selectedUser.lawyer_id}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) { console.error(err); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const sortedLawyers = [...lawyers
    .filter(l => l.name.toLowerCase().includes(search.toLowerCase()))
  ].sort((a, b) => {
    const tA = lastMessageTime[a.lawyer_id] ? new Date(lastMessageTime[a.lawyer_id]) : new Date(0);
    const tB = lastMessageTime[b.lawyer_id] ? new Date(lastMessageTime[b.lawyer_id]) : new Date(0);
    return tB - tA;
  });

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = fmtDate(msg.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="d-flex" style={{ background: bg, height: '100vh', overflow: 'hidden', color: textMain, transition: 'all 0.3s ease' }}>

      {/* NOTIFICATION POPUP */}
      {notification && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3"
          style={{ zIndex: 3000, maxWidth: '380px', width: '90%', animation: 'slideDown 0.3s ease-out' }}>
          <div className="rounded-4 p-3 shadow-lg"
            style={{ background: isDark ? 'linear-gradient(135deg,#111827,#1f2937)' : '#ffffff', border: '1px solid rgba(251,191,36,0.3)', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
            onClick={() => {
              const found = lawyers.find(l => l.lawyer_id === notification.lawyerId);
              if (found) { setSelectedUser(found); setMessages([]); markAsRead(found.lawyer_id); }
              setNotification(null);
            }}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                style={{ width: 44, height: 44, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: '16px' }}>
                {notification.from.charAt(0)}
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <div className="fw-bold" style={{ fontSize: '14px', color: textMain }}>{notification.from}</div>
                <div style={{ fontSize: '12px', marginTop: '2px', color: textSub }}>{notification.message}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setNotification(null); }}
                className="btn-close flex-shrink-0"
                style={{ filter: isDark ? 'invert(1)' : 'none', opacity: 0.5 }} />
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" />

      {/* LEFT PANEL */}
      <div className="d-flex flex-column flex-shrink-0"
        style={{ width: '280px', borderRight: `1px solid ${panelBorder}`, background: panelBg }}>

        <div className="p-3 pb-2" style={{ borderBottom: `1px solid ${panelBorder}` }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3" style={{ background: 'rgba(251,191,36,0.15)' }}>
                <MessageSquare size={18} className="text-warning" />
              </div>
              <h6 className="fw-bold mb-0" style={{ color: textMain }}>Messages</h6>
            </div>
            <button onClick={() => setNotifSound(!notifSound)} className="btn btn-sm p-0"
              style={{ background: 'none', border: 'none', color: notifSound ? '#fbbf24' : textSub, cursor: 'pointer' }}>
              {notifSound ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
          </div>
          <div className="d-flex align-items-center px-3 py-2 rounded-pill"
            style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
            <Search size={13} style={{ color: textSub }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lawyers..."
              className="form-control bg-transparent border-0 shadow-none ms-2 p-0"
              style={{ fontSize: '13px', color: textMain }} />
          </div>
        </div>

        <div className="flex-grow-1 py-2" style={{ overflowY: 'auto' }}>
          {sortedLawyers.map((lawyer) => {
            if (role === 'lawyer' && lawyer.lawyer_id === myId) return null;
            const isActive    = selectedUser?.lawyer_id === lawyer.lawyer_id;
            const unreadCount = unreadCounts[lawyer.lawyer_id] || 0;
            return (
              <div key={lawyer.lawyer_id}
                onClick={() => { setSelectedUser(lawyer); setMessages([]); markAsRead(lawyer.lawyer_id); }}
                className="d-flex align-items-center gap-3 px-3 py-3"
                style={{ background: isActive ? activeItem : 'transparent', borderLeft: isActive ? '3px solid #fbbf24' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold position-relative"
                  style={{ width: 40, height: 40, background: isActive ? 'rgba(251,191,36,0.2)' : inputBg, color: isActive ? '#fbbf24' : textSub, fontSize: '15px' }}>
                  {lawyer.name.charAt(0)}
                  {unreadCount > 0 && (
                    <div className="position-absolute d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: '20px', height: '20px', background: '#ef4444', color: 'white', borderRadius: '50%', bottom: '-2px', right: '-2px', fontSize: '10px', border: `2px solid ${bg}` }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden flex-grow-1">
                  <div className="fw-semibold small text-truncate" style={{ color: textMain }}>{lawyer.name}</div>
                  <div style={{ fontSize: '11px', color: textSub }}>{lawyer.specialization}</div>
                </div>
                {isActive && <div className="flex-shrink-0 rounded-circle" style={{ width: '8px', height: '8px', background: '#22c55e' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="d-flex flex-column flex-grow-1" style={{ overflow: 'hidden' }}>
        {selectedUser ? (
          <>
            <div className="d-flex align-items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ borderBottom: `1px solid ${panelBorder}`, background: panelBg }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{ width: 42, height: 42, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: '16px' }}>
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <div className="fw-bold" style={{ color: textMain }}>{selectedUser.name}</div>
                <div style={{ fontSize: '12px', color: textSub }}>{selectedUser.specialization}</div>
              </div>
              <div className="ms-auto">
                <div className="rounded-pill px-3 py-1" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>● Online</div>
              </div>
            </div>

            <div className="flex-grow-1 px-4 py-3" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="d-flex align-items-center gap-3 my-3">
                    <div style={{ flex: 1, height: '1px', background: dividerBg }} />
                    <span style={{ fontSize: '11px', color: textSub }}>{date}</span>
                    <div style={{ flex: 1, height: '1px', background: dividerBg }} />
                  </div>
                  {msgs.map((msg) => {
                    const isMine = String(msg.sender_id) === String(myId);
                    return (
                      <div key={msg.message_id} className="d-flex mb-2" style={{ justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        {!isMine && (
                          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 me-2"
                            style={{ width: 32, height: 32, alignSelf: 'flex-end', background: inputBg, color: textSub, fontSize: '13px' }}>
                            {msg.sender_name?.charAt(0)}
                          </div>
                        )}
                        <div style={{ maxWidth: '65%' }}>
                          <div className="px-3 py-2 rounded-4" style={{
                            background: isMine ? 'rgba(251,191,36,0.15)' : msgInBg,
                            border: isMine ? '1px solid rgba(251,191,36,0.2)' : `1px solid ${msgInBorder}`,
                            borderBottomRightRadius: isMine ? '4px' : '16px',
                            borderBottomLeftRadius:  isMine ? '16px' : '4px',
                            color: isMine ? (isDark ? '#fef3c7' : '#1e293b') : textMain,
                            fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word'
                          }}>
                            {msg.message}
                          </div>
                          <div style={{ fontSize: '10px', color: timeColor, marginTop: '4px', textAlign: isMine ? 'right' : 'left', paddingLeft: isMine ? 0 : '4px', paddingRight: isMine ? '4px' : 0 }}>
                            {fmtTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              {messages.length === 0 && !loading && (
                <div className="text-center my-auto" style={{ fontSize: '14px', color: textSub }}>No messages yet. Say hello! 👋</div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${panelBorder}`, background: panelBg }}>
              <div className="d-flex align-items-end gap-3 rounded-4 px-4 py-3" style={{ background: inputBarBg, border: `1px solid ${inputBarBdr}` }}>
                <textarea rows={1} value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedUser.name}...`}
                  className="form-control bg-transparent border-0 shadow-none p-0 flex-grow-1"
                  style={{ resize: 'none', fontSize: '14px', maxHeight: '100px', overflowY: 'auto', lineHeight: 1.5, color: textMain }} />
                <button onClick={handleSend} disabled={!newMsg.trim()}
                  className="btn rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 40, height: 40, padding: 0, background: newMsg.trim() ? '#fbbf24' : inputBg, color: newMsg.trim() ? '#0b1220' : textSub, border: 'none', transition: 'all 0.2s' }}>
                  <Send size={16} />
                </button>
              </div>
              <div style={{ fontSize: '11px', color: textSub, marginTop: '8px', paddingLeft: '4px' }}>
                Press Enter to send · Shift+Enter for new line
              </div>
            </div>
          </>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center">
            <div className="p-4 rounded-4 mb-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <MessageSquare size={48} className="text-warning" />
            </div>
            <h5 className="fw-bold mb-2" style={{ color: textMain }}>Internal Messaging</h5>
            <p style={{ maxWidth: '280px', color: textSub, fontSize: '14px' }}>
              Select a lawyer from the left panel to start a confidential conversation.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .form-control:focus { box-shadow: none !important; }
        .form-control::placeholder { color: ${textSub} !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 4px; }
        @keyframes slideDown {
          from { transform: translateY(-80px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Messages;