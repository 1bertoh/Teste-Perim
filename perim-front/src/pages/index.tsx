import { useState, useMemo, useEffect } from 'react';
import DefaultLayout from '@/layouts/default';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Progress } from '@heroui/progress';
import { getRelatorio } from './_requests';

interface ApiStatsData {
    total_clientes: number;
    total_entregas: number;
    total_enderecos: number;
    total_entregadores: number;
    entregas_por_mes: { mes: string; total: number }[];
    top_clientes_com_mais_entregas: { id: number; nome: string; total_entregas: number }[];
    entregador_do_dia: { id: number | null; nome: string; total_entregas_hoje: number };
    distribuicao_status_entregas: { status: string; total: number }[];
}

const Dashboard = () => {
    const [apiStats, setApiStats] = useState<ApiStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApiStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getRelatorio()

                setApiStats(res.data);
                setLoading(false);

            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("Ocorreu um erro desconhecido");
                }
                setLoading(false);
            }
        };

        fetchApiStats();
    }, []);

    const hojeFormatado = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const processedStats = useMemo(() => {
        if (!apiStats) {
            return {
                totalHoje: 0,
                pendentes: 0,
                emTransito: 0,
                entregues: 0,
                percentualConcluidas: 0,
            };
        }

        const distribuicao = apiStats.distribuicao_status_entregas.reduce((acc, item) => {
            acc[item.status.toLowerCase()] = item.total;
            return acc;
        }, {} as Record<string, number>);

        const pendentes = distribuicao['pendente'] || 0;
        const emTransito = distribuicao['em_transito'] || 0;
        const entregues = distribuicao['entregue'] || 0;
        
        const totalComStatus = pendentes + emTransito + entregues;
        const percentualConcluidas = totalComStatus > 0 ? Math.round((entregues / totalComStatus) * 100) : 0;

        return {
            totalComStatus, 
            pendentes,
            emTransito,
            entregues,
            percentualConcluidas,
        };
    }, [apiStats]);


    if (loading) {
        return (
            <DefaultLayout>
                <div className="flex h-full grow flex-col items-center justify-center">
                    <p className="text-gray-700 text-xl">Carregando dashboard...</p>
                </div>
            </DefaultLayout>
        );
    }

    if (error) {
        return (
            <DefaultLayout>
                <div className="flex h-full grow flex-col items-center justify-center p-10">
                    <Card className="bg-red-50 border-red-200 w-full max-w-md">
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-red-700">Erro ao carregar o Dashboard</h2>
                        </CardHeader>
                        <CardBody>
                            <p className="text-red-600">{error}</p>
                            <p className="text-sm text-gray-500 mt-2">Por favor, tente recarregar a página ou contate o suporte.</p>
                        </CardBody>
                    </Card>
                </div>
            </DefaultLayout>
        );
    }

    if (!apiStats) {
         return (
            <DefaultLayout>
                <div className="flex h-full grow flex-col items-center justify-center">
                    <p className="text-gray-700 text-xl">Nenhum dado de estatística encontrado.</p>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="flex h-full grow flex-col">
                <main className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center">
                    <div className="flex flex-col w-full max-w-7xl py-5">
                        <div className="mb-8">
                            <h1 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight">Dashboard de Entregas</h1>
                            <p className="text-gray-600 mt-1">Visão geral do sistema - {hojeFormatado}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                                <CardBody className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-600 text-sm font-medium">Total de Clientes</p>
                                            <p className="text-3xl font-bold text-purple-900">{apiStats.total_clientes}</p>
                                        </div>
                                        <div className="bg-purple-500 p-3 rounded-full">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                             <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                                <CardBody className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-indigo-600 text-sm font-medium">Total de Entregas (Sistema)</p>
                                            <p className="text-3xl font-bold text-indigo-900">{apiStats.total_entregas}</p>
                                        </div>
                                        <div className="bg-indigo-500 p-3 rounded-full">
                                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8zm6-10l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                                <CardBody className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-cyan-600 text-sm font-medium">Total de Endereços</p>
                                            <p className="text-3xl font-bold text-cyan-900">{apiStats.total_enderecos}</p>
                                        </div>
                                        <div className="bg-cyan-500 p-3 rounded-full">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                                <CardBody className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-teal-600 text-sm font-medium">Total de Entregadores</p>
                                            <p className="text-3xl font-bold text-teal-900">{apiStats.total_entregadores}</p>
                                        </div>
                                        <div className="bg-teal-500 p-3 rounded-full">
                                           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"></path></svg>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>


                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Status das Entregas (Geral)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                                <CardBody className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-yellow-600 text-sm font-medium">Pendentes</p>
                                            <p className="text-3xl font-bold text-yellow-900">{processedStats.pendentes}</p>
                                        </div>
                                        <div className="bg-yellow-500 p-3 rounded-full">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                <CardBody className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-600 text-sm font-medium">Em Trânsito</p>
                                            <p className="text-3xl font-bold text-blue-900">{processedStats.emTransito}</p>
                                        </div>
                                        <div className="bg-blue-500 p-3 rounded-full">
                                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8zm6-10l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                                <CardBody className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-600 text-sm font-medium">Concluídas</p>
                                            <p className="text-3xl font-bold text-green-900">{processedStats.entregues}</p>
                                        </div>
                                        <div className="bg-green-500 p-3 rounded-full">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        <Card className="mb-8">
                            <CardHeader className="pb-2">
                                <h3 className="text-xl font-semibold text-gray-900">Progresso Geral das Entregas (Baseado nas entregues)</h3>
                            </CardHeader>
                            <CardBody className="pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Entregas Concluídas</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {processedStats.entregues} de {processedStats.totalComStatus} ({processedStats.percentualConcluidas}%)
                                    </span>
                                </div>
                                <Progress
                                    value={processedStats.percentualConcluidas}
                                    color="success"
                                    size="lg"
                                    className="mb-4"
                                />
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-yellow-600">{processedStats.pendentes}</p>
                                        <p className="text-xs text-gray-500">Pendentes</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">{processedStats.emTransito}</p>
                                        <p className="text-xs text-gray-500">Em Trânsito</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">{processedStats.entregues}</p>
                                        <p className="text-xs text-gray-500">Entregues</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <Card>
                                <CardHeader>
                                    <h3 className="text-xl font-semibold text-gray-900">Entregador do Dia</h3>
                                </CardHeader>
                                <CardBody>
                                    {apiStats.entregador_do_dia && apiStats.entregador_do_dia.id ? (
                                        <>
                                            <p className="text-2xl font-bold text-blue-700">{apiStats.entregador_do_dia.nome}</p>
                                            <p className="text-gray-600">{apiStats.entregador_do_dia.total_entregas_hoje} entregas hoje</p>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">{apiStats.entregador_do_dia?.nome || "Informação não disponível"}</p>
                                    )}
                                </CardBody>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <h3 className="text-xl font-semibold text-gray-900">Top Clientes (Mais Entregas)</h3>
                                </CardHeader>
                                <CardBody>
                                    {apiStats.top_clientes_com_mais_entregas.length > 0 ? (
                                        <ul className="space-y-3">
                                            {apiStats.top_clientes_com_mais_entregas.map(cliente => (
                                                <li key={cliente.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                    <span className="text-gray-800">{cliente.nome}</span>
                                                    <Chip color="secondary" size="sm" variant="flat">{cliente.total_entregas} entregas</Chip>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">Nenhum cliente no top.</p>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                        
                        <Card className="mb-8">
                            <CardHeader>
                                 <h3 className="text-xl font-semibold text-gray-900">Entregas por Mês (Últimos 6 meses)</h3>
                            </CardHeader>
                            <CardBody>
                                {apiStats.entregas_por_mes.length > 0 ? (
                                     <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total de Entregas</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {apiStats.entregas_por_mes.map(item => (
                                                    <tr key={item.mes}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.mes}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Nenhum dado de entregas por mês.</p>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </main>
            </div>
        </DefaultLayout>
    );
};

export default Dashboard;
