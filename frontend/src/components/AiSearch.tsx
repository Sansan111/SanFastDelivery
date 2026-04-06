'use client';
import { useState, useRef, useEffect } from 'react';
import { Spin } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  calories: number;
  category: string;
}

interface AiSearchProps {
  onAddToCart: (product: Product) => void;
}

const QUICK_PROMPTS = [
  '🌶️ อาหารแซ่บๆ',
  '🧊 ของหวานเย็นๆ',
  '🥗 อาหารแคลต่ำ',
  '🦐 อาหารทะเล',
  '☕ เครื่องดื่ม',
  '🏋️ คลีนฟู้ด',
  '🍜 ก๋วยเตี๋ยว',
  '🍖 อาหารระดับพรีเมียม',
];

export default function AiSearch({ onAddToCart }: AiSearchProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const search = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(false);
    setResults([]);
    try {
      const res = await fetch('http://localhost:8081/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    setAddedIds(prev => [...prev, product.id]);
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="ai-fab"
        onClick={() => setOpen(o => !o)}
        title="ให้ AI แนะนำเมนู"
      >
        <span className="ai-fab-icon">✨</span>
        <span className="ai-fab-label">AI แนะนำ</span>
      </button>

      {/* Panel */}
      {open && (
        <div className={`ai-panel ${expanded ? 'ai-panel--expanded' : ''}`}>
          <div className="ai-panel-header">
            <div className="ai-panel-title">
              <span className="ai-panel-emoji">🤖</span>
              <div>
                <div className="ai-panel-name">AI แนะนำเมนู</div>
                <div className="ai-panel-sub">ค้นหาเมนูที่ตรงใจคุณวันนี้</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="ai-panel-close"
                onClick={() => setExpanded(e => !e)}
                title={expanded ? 'ย่อ' : 'ขยาย'}
              >
                {expanded ? '⊡' : '⛶'}
              </button>
              <button className="ai-panel-close" onClick={() => setOpen(false)}>✕</button>
            </div>
          </div>

          <div className="ai-panel-body">
            {/* Quick prompts */}
            <div className="ai-quick-prompts">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  className="ai-quick-chip"
                  onClick={() => { setQuery(p.replace(/^\S+\s/, '')); search(p); }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="ai-input-row">
              <input
                ref={inputRef}
                className="ai-input"
                placeholder="อยากกินอะไร? ลองพิมพ์เลย..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search(query)}
              />
              <button
                className="ai-search-btn"
                onClick={() => search(query)}
                disabled={loading}
              >
                {loading ? '...' : '→'}
              </button>
            </div>

            {/* Results */}
            <div className="ai-results">
              {loading && (
                <div className="ai-loading">
                  <Spin size="small" />
                  <span>AI กำลังคิด...</span>
                </div>
              )}
              {!loading && searched && results.length === 0 && (
                <div className="ai-empty">ไม่พบเมนูที่ตรงกัน ลองค้นหาใหม่นะครับ 🙏</div>
              )}
              {!loading && results.length > 0 && (
                <div className="ai-result-grid">
                  {results.map(product => (
                    <div key={product.id} className="ai-result-card">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="ai-result-img"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'; }}
                      />
                      <div className="ai-result-info">
                        <div className="ai-result-name">{product.name}</div>
                        <div className="ai-result-meta">
                          {product.calories > 0 && <span className="ai-cal-tag">{product.calories} แคล</span>}
                          {product.category && <span className="ai-cat-tag">{product.category}</span>}
                        </div>
                        <div className="ai-result-footer">
                          <span className="ai-result-price">฿{product.price}</span>
                          <button
                            className={`ai-add-btn ${addedIds.includes(product.id) ? 'ai-add-btn--added' : ''}`}
                            onClick={() => handleAdd(product)}
                          >
                            {addedIds.includes(product.id) ? '✓ เพิ่มแล้ว' : (
                              <><ShoppingCartOutlined /> ใส่ตะกร้า</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
