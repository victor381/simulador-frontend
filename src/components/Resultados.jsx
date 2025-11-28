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

  const formatarMoedaCompacta = (valor) => {
    if (Math.abs(valor) >= 1000000) {
      return `R$ ${(valor / 1000000).toFixed(2).replace('.', ',')}M`;
    }
    if (Math.abs(valor) >= 1000) {
      return `R$ ${(valor / 1000).toFixed(2).replace('.', ',')}k`;
    }
    return formatarMoeda(valor);
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
    ano: r.ano.toString(),
    'Economia': r.comparativo.economia > 0 ? r.comparativo.economia : 0,
    'Gasto Adicional': r.comparativo.gastoAdicional > 0 ? r.comparativo.gastoAdicional : 0
  }));

  const dadosDetalhado = resultado.resultados.map(r => ({
    ano: r.ano.toString(),
    'CBS': r.regimeNovo.cbs,
    'IBS Estadual': r.regimeNovo.ibsEstadual,
    'IBS Municipal': r.regimeNovo.ibsMunicipal
  }));

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start', 
        marginBottom: '2.5rem',
        flexWrap: 'wrap',
        gap: '1.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '2px solid #f3f4f6'
      }}>
        <div>
          <h2 style={{ 
            marginBottom: '0.5rem', 
            color: '#111827',
            fontSize: '1.875rem',
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            Resultado da Simulação
          </h2>
          {resultado.dadosEmpresa && (
            <p style={{ 
              color: '#6b7280',
              fontSize: '1rem',
              margin: 0,
              fontWeight: '500'
            }}>
              {resultado.dadosEmpresa.razaoSocial}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={exportarPDF}
            className="btn"
            style={{
              background: '#10b981',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => e.target.style.background = '#059669'}
            onMouseLeave={(e) => e.target.style.background = '#10b981'}
          >
            <span>📄</span> Exportar PDF
          </button>
          <button
            onClick={onNovaSimulacao}
            className="btn"
            style={{
              background: '#f3f4f6',
              color: '#374151',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.875rem',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
            onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
          >
            Nova Simulação
          </button>
        </div>
      </div>

      {/* Resumo Geral - Design Profissional */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '2px solid #f3f4f6'
        }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, marginBottom: '0.25rem', color: '#111827' }}>
              Resumo Geral
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Período: {resultado.parametros.anoInicio} - {resultado.parametros.anoFim}
            </p>
          </div>
          <div style={{
            background: resultado.resumo.beneficioLiquido ? '#d1fae5' : '#fee2e2',
            color: resultado.resumo.beneficioLiquido ? '#065f46' : '#991b1b',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {resultado.resumo.beneficioLiquido ? '✓' : '⚠'} {resultado.resumo.beneficioLiquido ? 'Benefício Líquido' : 'Custo Adicional'}
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
        className="resumo-grid"
        >
          {/* Economia Total */}
          <div style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            transition: 'all 0.2s',
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Economia Total
            </div>
            <div style={{ 
              fontSize: 'clamp(1.125rem, 3.5vw, 1.75rem)', 
              fontWeight: '700', 
              lineHeight: '1.2', 
              marginBottom: '0.5rem', 
              color: '#111827',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {formatarMoedaCompacta(resultado.resumo.totalEconomia)}
            </div>
            {resultado.resumo.economiaPercentual > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {resultado.resumo.economiaPercentual.toFixed(2)}% do faturamento
              </div>
            )}
          </div>

          {/* Gasto Adicional Total */}
          <div style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            transition: 'all 0.2s',
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Gasto Adicional Total
            </div>
            <div style={{ 
              fontSize: 'clamp(1.125rem, 3.5vw, 1.75rem)', 
              fontWeight: '700', 
              lineHeight: '1.2', 
              marginBottom: '0.5rem', 
              color: '#111827',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {formatarMoedaCompacta(resultado.resumo.totalGasto)}
            </div>
            {resultado.resumo.gastoPercentual > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {resultado.resumo.gastoPercentual.toFixed(2)}% do faturamento
              </div>
            )}
          </div>

          {/* Saldo Final - Destaque */}
          <div style={{
            background: resultado.resumo.beneficioLiquido 
              ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
              : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: `2px solid ${resultado.resumo.beneficioLiquido ? '#10b981' : '#ef4444'}`,
            transition: 'all 0.2s',
            boxShadow: resultado.resumo.beneficioLiquido 
              ? '0 4px 6px -1px rgba(16, 185, 129, 0.1)' 
              : '0 4px 6px -1px rgba(239, 68, 68, 0.1)',
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: resultado.resumo.beneficioLiquido ? '#065f46' : '#991b1b', marginBottom: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Saldo Final
            </div>
            <div style={{ 
              fontSize: 'clamp(1.125rem, 3.5vw, 1.75rem)', 
              fontWeight: '800',
              lineHeight: '1.2',
              marginBottom: '0.5rem',
              color: resultado.resumo.beneficioLiquido ? '#065f46' : '#991b1b',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {formatarMoedaCompacta(resultado.resumo.saldoFinal)}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              fontWeight: '600',
              color: resultado.resumo.beneficioLiquido ? '#065f46' : '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {resultado.resumo.beneficioLiquido ? '✓' : '⚠'} {resultado.resumo.beneficioLiquido ? 'Benefício' : 'Custo Adicional'}
            </div>
          </div>

          {/* Anos com Benefício */}
          <div style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            transition: 'all 0.2s',
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Anos com Benefício
            </div>
            <div style={{ 
              fontSize: 'clamp(1.25rem, 4vw, 2rem)', 
              fontWeight: '700', 
              lineHeight: '1.2', 
              marginBottom: '0.5rem', 
              color: '#111827',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%'
            }}>
              {resultado.resumo.anosComBeneficio} / {resultado.resultados.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {resultado.resumo.anosComCusto} anos com custo
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ 
        marginBottom: '2.5rem',
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          marginBottom: '1.5rem', 
          color: '#111827', 
          fontSize: '1.25rem', 
          fontWeight: '700',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          Comparativo de Impostos por Ano
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="ano" 
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: '500' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tickFormatter={(value) => {
                if (value === 0) return 'R$ 0';
                if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
                return `R$ ${value.toFixed(0)}`;
              }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip 
              formatter={(value) => formatarMoeda(value)}
              labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '4px' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="Regime Atual" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line 
              type="monotone" 
              dataKey="Regime Novo" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line 
              type="monotone" 
              dataKey="Diferença" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f59e0b', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        marginBottom: '2.5rem',
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          marginBottom: '1.5rem', 
          color: '#111827', 
          fontSize: '1.25rem', 
          fontWeight: '700',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          Economia vs Gasto Adicional por Ano
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dadosEconomia} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="ano" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tickFormatter={(value) => {
                if (value === 0) return 'R$ 0';
                if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
                return `R$ ${value.toFixed(0)}`;
              }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (value === 0) return null;
                return [formatarMoeda(value), name];
              }}
              labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '4px' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar 
              dataKey="Economia" 
              fill="#10b981" 
              name="Economia" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="Gasto Adicional" 
              fill="#ef4444" 
              name="Gasto Adicional"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        marginBottom: '2.5rem',
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          marginBottom: '1.5rem', 
          color: '#111827', 
          fontSize: '1.25rem', 
          fontWeight: '700',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          Composição dos Impostos do Novo Regime
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dadosDetalhado} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="ano" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tickFormatter={(value) => {
                if (value === 0) return 'R$ 0';
                if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
                return `R$ ${value.toFixed(0)}`;
              }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip 
              formatter={(value) => formatarMoeda(value)}
              labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '4px' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar dataKey="CBS" stackId="a" fill="#3b82f6" name="CBS" />
            <Bar dataKey="IBS Estadual" stackId="a" fill="#8b5cf6" name="IBS Estadual" />
            <Bar dataKey="IBS Municipal" stackId="a" fill="#ec4899" name="IBS Municipal" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela Detalhada */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          marginBottom: '1.5rem', 
          color: '#111827', 
          fontSize: '1.25rem', 
          fontWeight: '700',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          Detalhamento por Ano
        </h3>
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'left', 
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>Ano</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'right', 
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>Regime Atual</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'right', 
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>CBS</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'right', 
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>IBS Estadual</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'right', 
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>IBS Municipal</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'right', 
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>Total Novo</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'right', 
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>Diferença</th>
                <th style={{ 
                  padding: '1rem', 
                  textAlign: 'center', 
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280',
                  fontWeight: '600'
                }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {resultado.resultados.map((r, index) => (
                <tr key={r.ano} style={{ 
                  borderBottom: '1px solid #f3f4f6',
                  background: index % 2 === 0 ? 'white' : '#f9fafb',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f9fafb'}
                >
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>
                    {r.ano}
                    {r.regimeNovo.fase && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'normal', marginTop: '0.25rem' }}>
                        {r.regimeNovo.fase}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#374151', fontWeight: '500' }}>
                    {formatarMoeda(r.regimeAtual.imposto)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#374151', fontWeight: '500' }}>
                    {formatarMoeda(r.regimeNovo.cbs)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#374151', fontWeight: '500' }}>
                    {formatarMoeda(r.regimeNovo.ibsEstadual)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#374151', fontWeight: '500' }}>
                    {formatarMoeda(r.regimeNovo.ibsMunicipal)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                    {formatarMoeda(r.regimeNovo.total)}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'right',
                    fontWeight: '600',
                    color: r.comparativo.beneficio ? '#059669' : '#dc2626'
                  }}>
                    {formatarMoeda(r.comparativo.diferenca)}
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'normal', marginTop: '0.25rem' }}>
                      {formatarPercentual(r.comparativo.percentualVariacao)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: r.comparativo.beneficio ? '#d1fae5' : '#fee2e2',
                      color: r.comparativo.beneficio ? '#065f46' : '#991b1b'
                    }}>
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
        marginTop: '2.5rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '16px',
        fontSize: '0.875rem',
        color: '#6b7280',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
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

