import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Resultados({ resultado, onNovaSimulacao }) {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPercentual = (valor) => {
    return `${valor >= 0 ? '+' : ''}${valor.toFixed(2)}%`;
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Simulação - Reforma Tributária', 14, 20);
    
    // Informações da Empresa
    if (resultado.dadosEmpresa) {
      doc.setFontSize(12);
      doc.text(`Empresa: ${resultado.dadosEmpresa.razaoSocial}`, 14, 35);
      if (resultado.dadosEmpresa.nomeFantasia) {
        doc.text(`Nome Fantasia: ${resultado.dadosEmpresa.nomeFantasia}`, 14, 42);
      }
      doc.text(`CNPJ: ${resultado.cnpj}`, 14, 49);
      doc.text(`UF: ${resultado.dadosEmpresa.uf} | Município: ${resultado.dadosEmpresa.municipio}`, 14, 56);
    }
    
    // Parâmetros
    doc.setFontSize(11);
    doc.text('Parâmetros da Simulação:', 14, 68);
    doc.setFontSize(10);
    doc.text(`Faturamento Anual: ${formatarMoeda(resultado.parametros.faturamentoAnual)}`, 14, 75);
    doc.text(`Regime Atual: ${resultado.parametros.regimeAtual}`, 14, 82);
    doc.text(`Período: ${resultado.parametros.anoInicio} - ${resultado.parametros.anoFim}`, 14, 89);
    
    // Resumo
    doc.setFontSize(11);
    doc.text('Resumo Geral:', 14, 101);
    doc.setFontSize(10);
    doc.text(`Economia Total: ${formatarMoeda(resultado.resumo.totalEconomia)}`, 14, 108);
    doc.text(`Gasto Adicional Total: ${formatarMoeda(resultado.resumo.totalGasto)}`, 14, 115);
    doc.text(`Saldo Final: ${formatarMoeda(resultado.resumo.saldoFinal)}`, 14, 122);
    doc.text(`Status: ${resultado.resumo.beneficioLiquido ? 'Benefício Líquido' : 'Custo Adicional'}`, 14, 129);
    
    // Tabela de resultados
    const tableData = resultado.resultados.map(r => [
      r.ano.toString(),
      formatarMoeda(r.regimeAtual.imposto),
      formatarMoeda(r.regimeNovo.cbs),
      formatarMoeda(r.regimeNovo.ibsEstadual),
      formatarMoeda(r.regimeNovo.ibsMunicipal),
      formatarMoeda(r.regimeNovo.total),
      formatarMoeda(r.comparativo.diferenca),
      r.comparativo.beneficio ? 'Benefício' : 'Custo'
    ]);
    
    doc.autoTable({
      startY: 140,
      head: [['Ano', 'Regime Atual', 'CBS', 'IBS Estadual', 'IBS Municipal', 'Total Novo', 'Diferença', 'Status']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 102, 204] }
    });
    
    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Gerado em ${new Date().toLocaleString('pt-BR')} | Página ${i} de ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }
    
    // Salvar
    const nomeArquivo = `simulacao-reforma-tributaria-${resultado.cnpj || 'empresa'}-${Date.now()}.pdf`;
    doc.save(nomeArquivo);
  };

  // Preparar dados para gráficos
  const dadosGrafico = resultado.resultados.map(r => ({
    ano: r.ano,
    'Regime Atual': r.regimeAtual.imposto,
    'Regime Novo': r.regimeNovo.total,
    'Diferença': r.comparativo.diferenca
  }));

  const dadosEconomia = resultado.resultados.map(r => ({
    ano: r.ano,
    economia: r.comparativo.economia,
    gastoAdicional: r.comparativo.gastoAdicional
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
            Resultado da Simulação
          </h2>
          {resultado.dadosEmpresa && (
            <p style={{ color: 'var(--gray-600)' }}>
              {resultado.dadosEmpresa.razaoSocial}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={exportarPDF}
            className="btn"
            style={{
              background: 'var(--success)',
              color: 'var(--white)'
            }}
          >
            📄 Exportar PDF
          </button>
          <button
            onClick={onNovaSimulacao}
            className="btn"
            style={{
              background: 'var(--gray-200)',
              color: 'var(--gray-700)'
            }}
          >
            Nova Simulação
          </button>
        </div>
      </div>

      {/* Resumo Geral */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          Resumo Geral ({resultado.parametros.anoInicio}-{resultado.parametros.anoFim})
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              Economia Total
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>
              {formatarMoeda(resultado.resumo.totalEconomia)}
            </div>
            {resultado.resumo.economiaPercentual > 0 && (
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                {resultado.resumo.economiaPercentual.toFixed(2)}% do faturamento
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              Gasto Adicional Total
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>
              {formatarMoeda(resultado.resumo.totalGasto)}
            </div>
            {resultado.resumo.gastoPercentual > 0 && (
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                {resultado.resumo.gastoPercentual.toFixed(2)}% do faturamento
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              Saldo Final
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700',
              color: resultado.resumo.beneficioLiquido ? '#10b981' : '#ef4444'
            }}>
              {formatarMoeda(resultado.resumo.saldoFinal)}
            </div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {resultado.resumo.beneficioLiquido ? '✅ Benefício Líquido' : '⚠️ Custo Adicional'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              Anos com Benefício
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>
              {resultado.resumo.anosComBeneficio} / {resultado.resultados.length}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
              {resultado.resumo.anosComCusto} anos com custo adicional
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>
          Comparativo de Impostos por Ano
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" />
            <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
            <Tooltip 
              formatter={(value) => formatarMoeda(value)}
              labelStyle={{ color: 'var(--gray-900)' }}
            />
            <Legend />
            <Line type="monotone" dataKey="Regime Atual" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="Regime Novo" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>
          Economia vs Gasto Adicional
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosEconomia}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" />
            <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
            <Tooltip 
              formatter={(value) => formatarMoeda(value)}
              labelStyle={{ color: 'var(--gray-900)' }}
            />
            <Legend />
            <Bar dataKey="economia" fill="#10b981" name="Economia" />
            <Bar dataKey="gastoAdicional" fill="#ef4444" name="Gasto Adicional" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela Detalhada */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--gray-900)' }}>
          Detalhamento por Ano
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-100)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid var(--gray-300)' }}>Ano</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid var(--gray-300)' }}>Regime Atual</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid var(--gray-300)' }}>CBS</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid var(--gray-300)' }}>IBS Estadual</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid var(--gray-300)' }}>IBS Municipal</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid var(--gray-300)' }}>Total Novo</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid var(--gray-300)' }}>Diferença</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid var(--gray-300)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {resultado.resultados.map((r, index) => (
                <tr key={r.ano} style={{ 
                  borderBottom: '1px solid var(--gray-200)',
                  background: index % 2 === 0 ? 'var(--white)' : 'var(--gray-50)'
                }}>
                  <td style={{ padding: '0.75rem', fontWeight: '600' }}>{r.ano}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {formatarMoeda(r.regimeAtual.imposto)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {formatarMoeda(r.regimeNovo.cbs)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {formatarMoeda(r.regimeNovo.ibsEstadual)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {formatarMoeda(r.regimeNovo.ibsMunicipal)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                    {formatarMoeda(r.regimeNovo.total)}
                  </td>
                  <td style={{ 
                    padding: '0.75rem', 
                    textAlign: 'right',
                    fontWeight: '600',
                    color: r.comparativo.beneficio ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {formatarMoeda(r.comparativo.diferenca)}
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {formatarPercentual(r.comparativo.percentualVariacao)}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span className={`badge ${r.comparativo.beneficio ? 'badge-success' : 'badge-danger'}`}>
                      {r.comparativo.beneficio ? 'Benefício' : 'Custo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'var(--gray-50)',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: 'var(--gray-600)'
      }}>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Parâmetros da Simulação:</strong>
        </p>
        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Faturamento Anual: {formatarMoeda(resultado.parametros.faturamentoAnual)}</li>
          <li>Despesas Anuais: {formatarMoeda(resultado.parametros.despesasAnuais || 0)}</li>
          <li>Regime Atual: {resultado.parametros.regimeAtual}</li>
          <li>Período: {resultado.parametros.anoInicio} - {resultado.parametros.anoFim}</li>
          <li>Economia Média Anual: {formatarMoeda(resultado.resumo.economiaMediaAnual)}</li>
          <li>Gasto Médio Anual: {formatarMoeda(resultado.resumo.gastoMedioAnual)}</li>
        </ul>
        
        {resultado.dadosEmpresa && resultado.dadosEmpresa.detalhes && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Fatores Aplicados:</strong>
            </p>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Porte: {resultado.dadosEmpresa.detalhes.fatorAjusteAplicado || 'N/A'}</li>
              {resultado.resultados[0]?.regimeNovo?.detalhes && (
                <>
                  <li>Alíquota CBS Efetiva: {(resultado.resultados[0].regimeNovo.detalhes.aliquotaCBS * 100).toFixed(2)}%</li>
                  <li>Alíquota IBS Efetiva: {((resultado.resultados[0].regimeNovo.detalhes.aliquotaIBSEstadual + resultado.resultados[0].regimeNovo.detalhes.aliquotaIBSMunicipal) * 100).toFixed(2)}%</li>
                </>
              )}
            </ul>
          </div>
        )}
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: 'var(--warning)', 
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: '6px',
          borderLeft: '4px solid var(--warning)'
        }}>
          <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0 }}>
            ⚠️ <strong>Atenção:</strong> Esta simulação é uma estimativa baseada em alíquotas padrão da Reforma Tributária.
            Os valores reais podem variar conforme características específicas da empresa, setor, região e benefícios fiscais aplicáveis.
            Consulte sempre um contador ou especialista fiscal para decisões importantes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Resultados;

