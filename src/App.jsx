import React, { useState } from 'react';
import axios from 'axios';
import CNPJForm from './components/CNPJForm';
import EmpresaInfo from './components/EmpresaInfo';
import SimulacaoForm from './components/SimulacaoForm';
import Resultados from './components/Resultados';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [cnpj, setCnpj] = useState('');
  const [dadosEmpresa, setDadosEmpresa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [simulando, setSimulando] = useState(false);

  const buscarCNPJ = async (cnpjValue) => {
    setLoading(true);
    setError(null);
    setDadosEmpresa(null);
    setResultado(null);

    try {
      const response = await axios.get(`${API_BASE}/api/cnpj/${cnpjValue}`);
      setDadosEmpresa(response.data);
      setCnpj(cnpjValue);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao buscar CNPJ');
    } finally {
      setLoading(false);
    }
  };

  const simular = async (dadosSimulacao) => {
    setSimulando(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/api/simular`, {
        cnpj,
        dadosEmpresa,
        ...dadosSimulacao
      });
      setResultado(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao simular');
    } finally {
      setSimulando(false);
    }
  };

  const resetar = () => {
    setCnpj('');
    setDadosEmpresa(null);
    setResultado(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>Simulador de Reforma Tributária</h1>
          <p>Calcule o impacto da nova legislação fiscal na sua empresa</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {!dadosEmpresa && !loading && (
            <div className="card">
              <CNPJForm onBuscar={buscarCNPJ} loading={loading} error={error} />
            </div>
          )}

          {loading && !dadosEmpresa && (
            <div className="card">
              <LoadingSpinner message="Buscando dados da empresa..." />
            </div>
          )}

          {dadosEmpresa && !resultado && (
            <>
              <div className="card">
                <EmpresaInfo dados={dadosEmpresa} onReset={resetar} />
              </div>
              <div className="card">
                <SimulacaoForm 
                  dadosEmpresa={dadosEmpresa}
                  onSimular={simular}
                  loading={simulando}
                  error={error}
                />
              </div>
            </>
          )}

          {resultado && (
            <div className="card">
              <Resultados 
                resultado={resultado}
                onNovaSimulacao={resetar}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>
            Baseado na EC 132/2024 e LCP 214/2024 | 
            Dados da empresa via <a href="https://brasilapi.com.br" target="_blank" rel="noopener noreferrer">BrasilAPI</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

