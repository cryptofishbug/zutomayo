import { useEffect, useMemo, useState } from 'react';
import dataset from './generated/products.json';
import type { GeneratedData, Item, Variant } from './types';

const data = dataset as GeneratedData;

const delayedKeywords = [
  'sword keychain',
  'zs bag hanger keychain',
  'mirror shooter keychain',
  'zutomad labo chain broach',
  'zutomayo labo chain broach',
  'zs audio cable bracelet',
  'nirachan stained glass keychain shade',
  'nirachan stained glass keychain',
  'zt 2way glasses cord necklace',
  'uniguri ufo projector keychain',
  'shoga_st ufo projector keychain',
  "shamoji's ring light dark green",
];

function formatKrw(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isDelayed(item: Item, variant: Variant) {
  const haystack = [
    item.name,
    variant.originalItemName ?? '',
    variant.title ?? '',
    `${variant.title ?? ''} ${variant.option}`,
  ]
    .map(normalizeKey)
    .join(' ');

  return delayedKeywords.some((keyword) => haystack.includes(normalizeKey(keyword)));
}

function priceLabel(variant: Variant) {
  const popup = `팝업 ${formatKrw(variant.csvPriceKrw)}원`;
  if (!variant.priceJpy) {
    return popup;
  }
  return `${popup} / MART ¥${variant.priceJpy}`;
}

function pickPrimaryVariant(item: Item) {
  return [...item.variants].sort((left, right) => right.images.length - left.images.length)[0];
}

function itemKey(item: Item) {
  return [
    item.category,
    item.name,
    ...item.variants.map((variant) => variant.productId ?? `${variant.originalItemName ?? ''}:${variant.option}`),
  ].join('::');
}

export default function App() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [hideDelayed, setHideDelayed] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const closeModal = () => {
    setSelectedItem(null);
    setSelectedOption(null);
    setSelectedImage(null);
  };

  const categories = useMemo(() => {
    return ['전체', ...new Set(data.items.map((item) => item.category).filter(Boolean))];
  }, []);

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return data.items.filter((item) => {
      if (activeCategory !== '전체' && item.category !== activeCategory) {
        return false;
      }
      if (hideDelayed) {
        const primary = pickPrimaryVariant(item);
        if (isDelayed(item, primary)) {
          return false;
        }
      }
      if (!lowered) {
        return true;
      }
      const haystack = [
        item.name,
        ...item.variants.flatMap((variant) => [
          variant.option,
          variant.title ?? '',
          variant.originalItemName ?? '',
          variant.collection ?? '',
          variant.collectionKo ?? '',
        ]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(lowered);
    });
  }, [activeCategory, hideDelayed, query]);

  const activeVariant = useMemo(() => {
    if (!selectedItem) {
      return null;
    }
    if (selectedOption) {
      return selectedItem.variants.find((variant) => variant.option === selectedOption) ?? selectedItem.variants[0];
    }
    return selectedItem.variants[0];
  }, [selectedItem, selectedOption]);

  useEffect(() => {
    if (!activeVariant) {
      setSelectedImage(null);
      return;
    }
    setSelectedImage(activeVariant.images[0] ?? null);
  }, [activeVariant]);

  useEffect(() => {
    if (!selectedItem) {
      document.body.style.overflow = '';
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [selectedItem]);

  return (
    <div className="shell">
      <header className="hero">
        <div className="hero-copy compact">
          <p className="eyebrow">ZUTOMAYO POPUP - MART ARCHIVE</p>
          <h1>ZUTOMAYO POPUP - MART ARCHIVE</h1>
        </div>
      </header>

      <section className="toolbar">
        <div className="toolbar-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={category === activeCategory ? 'filter active' : 'filter'}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
          <button
            className={hideDelayed ? 'filter active' : 'filter'}
            onClick={() => setHideDelayed((value) => !value)}
            type="button"
          >
            입고 지연 숨기기
          </button>
        </div>
        <div className="toolbar-search">
          <label htmlFor="search">검색</label>
          <div className="search-wrap">
            <input
              id="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="상품명, 옵션, 사이트명으로 검색"
            />
            {query ? (
              <button className="search-clear" onClick={() => setQuery('')} type="button">
                ✕
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <main className="grid">
        {filtered.length === 0 ? (
          <p className="empty-state">
            {query ? `"${query}"에 해당하는 상품이 없습니다.` : '조건에 해당하는 상품이 없습니다.'}
          </p>
        ) : (
          filtered.map((item) => {
            const primary = pickPrimaryVariant(item);
            const delayed = isDelayed(item, primary);
            return (
              <article className="card" key={itemKey(item)}>
                <button
                  className="card-hit"
                  type="button"
                  onClick={() => {
                    setSelectedItem(item);
                    setSelectedOption(primary.option);
                    setSelectedImage(primary.images[0] ?? null);
                  }}
                >
                  <div className="card-image-wrap">
                    {primary.images[0] ? (
                      <img className="card-image" src={primary.images[0]} alt={item.name} loading="lazy" />
                    ) : (
                      <div className="card-image fallback">NO IMAGE</div>
                    )}
                    {delayed ? <div className="delay-mask">입고 지연</div> : null}
                  </div>
                  <div className="card-body">
                    <h2>{item.name}</h2>
                    {primary.collection ? <p className="card-collection">{primary.collection}</p> : null}
                    <p className="card-price">{priceLabel(primary)}</p>
                  </div>
                </button>
              </article>
            );
          })
        )}
      </main>

      {selectedItem && activeVariant ? (
        <div
          className="modal-backdrop"
          onClick={closeModal}
          role="presentation"
        >
          <section className="modal" onClick={(event) => event.stopPropagation()}>
            <button
              className="modal-close"
              onClick={closeModal}
              type="button"
            >
              닫기 ✕
            </button>
            <div className="modal-top">
              <div>
                <h3>{selectedItem.name}</h3>
                {activeVariant.collection ? <p className="modal-collection">{activeVariant.collection}</p> : null}
                <p className="card-price">{priceLabel(activeVariant)}</p>
              </div>
              {isDelayed(selectedItem, activeVariant) ? <div className="delay-pill">입고 지연</div> : null}
            </div>

            {selectedItem.variants.length > 1 ? (
              <div className="variant-tabs">
                {selectedItem.variants.map((variant) => (
                  <button
                    key={`${selectedItem.name}-${variant.option}`}
                    className={variant.option === activeVariant.option ? 'variant active' : 'variant'}
                    onClick={() => setSelectedOption(variant.option)}
                    type="button"
                  >
                    {variant.option}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="modal-content">
              <div className="gallery">
                <div className="gallery-hero">
                  {activeVariant.images[0] ? (
                    <img
                      src={selectedImage ?? activeVariant.images[0]}
                      alt={activeVariant.title ?? selectedItem.name}
                    />
                  ) : (
                    <div className="card-image fallback">NO IMAGE</div>
                  )}
                  {isDelayed(selectedItem, activeVariant) ? <div className="delay-mask modal-mask">입고 지연</div> : null}
                </div>
                <div className="gallery-grid">
                  {activeVariant.images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      className={image === (selectedImage ?? activeVariant.images[0]) ? 'thumb active' : 'thumb'}
                      onClick={() => setSelectedImage(image)}
                      type="button"
                    >
                      <img src={image} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>

              <aside className="detail">
                <section>
                  <h4>요약</h4>
                  {activeVariant.summary.length ? (
                    <ul>
                      {activeVariant.summary.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>요약 정보 없음</p>
                  )}
                </section>

                <section>
                  <h4>사이즈</h4>
                  {activeVariant.sizeLines.length ? (
                    <ul>
                      {activeVariant.sizeLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>표기 없음</p>
                  )}
                </section>

                <section>
                  <h4>모델</h4>
                  {activeVariant.modelLines.length ? (
                    <ul>
                      {activeVariant.modelLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>표기 없음</p>
                  )}
                </section>

                <section>
                  <h4>소재</h4>
                  {activeVariant.materialLines.length ? (
                    <ul>
                      {activeVariant.materialLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>표기 없음</p>
                  )}
                </section>

                <section>
                  <h4>정보</h4>
                  {activeVariant.country ? <p>제조국: {activeVariant.country}</p> : null}
                  {activeVariant.url ? (
                    <a href={activeVariant.url} target="_blank" rel="noreferrer">
                      원본 상세 페이지 열기
                    </a>
                  ) : null}
                </section>
              </aside>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
