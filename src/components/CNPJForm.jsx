import React, { useState } from 'react';

function CNPJForm({ onBuscar, loading, error }) {
  const [cnpj, setCnpj] = useState('');

  const formatarCNPJ = (value) => {
    const apenasNumeros = value.replace(/\D/g, '');
    if (apenasNumeros.length <= 14) {
      return apenasNumeros
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cnpj.replace(/\D/g, '').length === 14) {
      onBuscar(cnpj.replace(/\D/g, ''));
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>
        Consultar Empresa
      </h2>
      <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)' }}>
        Digite o CNPJ da empresa para iniciar a simulação
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" htmlFor="cnpj">
            CNPJ
          </label>
          <input
            id="cnpj"
            type="text"
            className="input"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={(e) => setCnpj(formatarCNPJ(e.target.value))}
            maxLength={18}
            disabled={loading}
            required
          />
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || cnpj.replace(/\D/g, '').length !== 14}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              Buscando...
            </>
          ) : (
            'Buscar Empresa'
          )}
        </button>
      </form>
    </div>
  );
}

export default CNPJForm;

