import React from 'react';

function EmpresaInfo({ dados, onReset }) {
  const regimeAtual = dados.regime_tributario?.[dados.regime_tributario.length - 1];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
            {dados.razao_social}
          </h2>
          {dados.nome_fantasia && (
            <p style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
              {dados.nome_fantasia}
            </p>
          )}
        </div>
        <button
          onClick={onReset}
          className="btn"
          style={{
            background: 'var(--gray-200)',
            color: 'var(--gray-700)'
          }}
        >
          Nova Consulta
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        <div>
          <div className="input-label">CNPJ</div>
          <div style={{ fontWeight: 500 }}>{dados.cnpj}</div>
        </div>
        
        <div>
          <div className="input-label">Situação</div>
          <div>
            <span className={`badge ${dados.situacao_cadastral === 2 ? 'badge-success' : 'badge-danger'}`}>
              {dados.descricao_situacao_cadastral}
            </span>
          </div>
        </div>

        <div>
          <div className="input-label">Porte</div>
          <div style={{ fontWeight: 500 }}>{dados.porte}</div>
        </div>

        <div>
          <div className="input-label">UF</div>
          <div style={{ fontWeight: 500 }}>{dados.uf}</div>
        </div>

        <div>
          <div className="input-label">Município</div>
          <div style={{ fontWeight: 500 }}>{dados.municipio}</div>
        </div>

        <div>
          <div className="input-label">CNAE Principal</div>
          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
            {dados.cnae_fiscal} - {dados.cnae_fiscal_descricao}
          </div>
        </div>

        {regimeAtual && (
          <div>
            <div className="input-label">Regime Tributário Atual</div>
            <div style={{ fontWeight: 500 }}>
              {regimeAtual.forma_de_tributacao}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
              Ano: {regimeAtual.ano}
            </div>
            {dados.regime_tributario && dados.regime_tributario.length > 1 && (
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--gray-400)', 
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}>
                Histórico disponível: {dados.regime_tributario.length} anos
              </div>
            )}
          </div>
        )}
        
        {dados.cnaes_secundarios && dados.cnaes_secundarios.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="input-label">CNAEs Secundários</div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}>
              {dados.cnaes_secundarios.slice(0, 3).map((cnae, idx) => (
                <span key={idx} className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                  {cnae.codigo} - {cnae.descricao.substring(0, 30)}...
                </span>
              ))}
              {dados.cnaes_secundarios.length > 3 && (
                <span className="badge" style={{ 
                  background: 'var(--gray-200)', 
                  color: 'var(--gray-600)',
                  fontSize: '0.75rem'
                }}>
                  +{dados.cnaes_secundarios.length - 3} mais
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmpresaInfo;

