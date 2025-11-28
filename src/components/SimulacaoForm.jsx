import React, { useState } from 'react';

function SimulacaoForm({ dadosEmpresa, onSimular, loading, error }) {
  const [faturamentoAnual, setFaturamentoAnual] = useState('');
  const [despesasAnuais, setDespesasAnuais] = useState('');
  const [regimeAtual, setRegimeAtual] = useState('');

  // Identificar regime atual sugerido
  React.useEffect(() => {
    if (dadosEmpresa) {
      const regimes = dadosEmpresa.regime_tributario;
      if (regimes && regimes.length > 0) {
        const ultimoRegime = regimes[regimes.length - 1];
        const formaTrib = ultimoRegime.forma_de_tributacao?.toUpperCase() || '';
        
        if (formaTrib.includes('SIMPLES') || dadosEmpresa.opcao_pelo_simples) {
          setRegimeAtual('SIMPLES_NACIONAL');
        } else if (dadosEmpresa.opcao_pelo_mei) {
          setRegimeAtual('MEI');
        } else if (formaTrib.includes('LUCRO REAL')) {
          setRegimeAtual('LUCRO_REAL');
        } else {
          setRegimeAtual('LUCRO_PRESUMIDO');
        }
      }
    }
  }, [dadosEmpresa]);

  const formatarMoeda = (value) => {
    const apenasNumeros = value.replace(/\D/g, '');
    if (apenasNumeros === '') return '';
    const numero = parseInt(apenasNumeros, 10) / 100;
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const faturamento = parseFloat(faturamentoAnual.replace(/\./g, '').replace(',', '.'));
    const despesas = despesasAnuais ? parseFloat(despesasAnuais.replace(/\./g, '').replace(',', '.')) : 0;
    
    if (faturamento > 0 && regimeAtual) {
      onSimular({
        faturamentoAnual: faturamento,
        despesasAnuais: despesas,
        regimeAtual
      });
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>
        Configurar Simulação
      </h2>
      <p style={{ marginBottom: '1.5rem', color: 'var(--gray-600)' }}>
        Informe os dados financeiros da empresa para calcular o impacto da Reforma Tributária
      </p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" htmlFor="faturamento">
            Faturamento Anual (R$)
          </label>
          <input
            id="faturamento"
            type="text"
            className="input"
            placeholder="1.000.000,00"
            value={faturamentoAnual}
            onChange={(e) => setFaturamentoAnual(formatarMoeda(e.target.value))}
            disabled={loading}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="despesas">
            Despesas Anuais (R$) <span style={{ color: 'var(--gray-400)', fontWeight: 'normal' }}>(opcional)</span>
          </label>
          <input
            id="despesas"
            type="text"
            className="input"
            placeholder="500.000,00"
            value={despesasAnuais}
            onChange={(e) => setDespesasAnuais(formatarMoeda(e.target.value))}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="regime">
            Regime Tributário Atual
          </label>
          <select
            id="regime"
            className="input"
            value={regimeAtual}
            onChange={(e) => setRegimeAtual(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Selecione o regime</option>
            <option value="SIMPLES_NACIONAL">Simples Nacional</option>
            <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
            <option value="LUCRO_REAL">Lucro Real</option>
            <option value="MEI">MEI</option>
          </select>
          {regimeAtual && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: 'var(--gray-50)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: 'var(--gray-600)'
            }}>
              💡 O regime foi identificado automaticamente com base nos dados da empresa.
              Você pode alterá-lo se necessário.
            </div>
          )}
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
          disabled={loading || !faturamentoAnual || !regimeAtual}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              Calculando...
            </>
          ) : (
            'Simular Cenário Fiscal'
          )}
        </button>
      </form>
    </div>
  );
}

export default SimulacaoForm;

