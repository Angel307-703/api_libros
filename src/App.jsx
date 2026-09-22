import React, { useState } from 'react';
import './styles.css';

export default function App() {
  const [query, setQuery] = useState('');
  const [minYear, setMinYear] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscarLibros = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!data.docs || data.docs.length === 0) {
        throw new Error('No se encontraron libros.');
      }

      let librosProcesados = data.docs;

      if (minYear) {
        librosProcesados = librosProcesados.filter(book => 
          book.first_publish_year && book.first_publish_year >= Number(minYear)
        );
      }

      librosProcesados.sort((a, b) => {
        const yearA = a.first_publish_year || 0;
        const yearB = b.first_publish_year || 0;
        return yearB - yearA;
      });

      setBooks(librosProcesados);
    } catch (err) {
      setError(err.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const obtenerAutor = (book) => {
    if (book.author_name && book.author_name.length > 0) {
      return book.author_name[0];
    }
    return 'Autor no disponible';
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div className="card" style={{ padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Biblioteca Digital</h1>
        
        <form onSubmit={buscarLibros} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Buscar libro o autor (ej. Harry Potter)..."
            style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="number" 
              value={minYear} 
              onChange={(e) => setMinYear(e.target.value)} 
              placeholder="Año mínimo (ej. 2000)"
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
            />
            <button type="submit" style={{ padding: '8px 16px', background: '#f1f1f1', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}>
              Buscar
            </button>
          </div>
        </form>

        {loading && <p>Cargando libros...</p>}
        {error && <p style={{ color: '#d9534f', fontSize: '14px' }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {books.length === 0 && !loading && !error && (
            <p style={{ color: '#888', fontSize: '14px' }}>No hay resultados para mostrar.</p>
          )}
          {books.slice(0, 10).map((book, index) => (
            <div key={index} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{book.title}</h3>
              <p style={{ fontSize: '13px', color: '#555', margin: '0 0 4px 0' }}>Autor: {obtenerAutor(book)}</p>
              <small style={{ color: '#666' }}>Año de publicación: {book.first_publish_year || 'Desconocido'}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}correcio