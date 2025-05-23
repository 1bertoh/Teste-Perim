import { useState } from 'react';
import DefaultLayout from '@/layouts/default';
import { Tab, Tabs } from '@heroui/tabs';
import DeliveryList from './_list';
import NewDelivery from './_register';

type SelectionType = 'list' | 'register';

const Page = () => {
     const [selection, setSelection] = useState<SelectionType>('register')
        const title = {
        list: {
            title: 'Entregas',
            subtitle: 'Gerencie as entregas cadastradas no sistema.'
        },
        register: {
            title: 'Nova Entrega',
            subtitle: 'Preencha os detalhes abaixo para registrar uma nova entrega.'
        },
    }

    return (
        <DefaultLayout>
            <div className="flex h-full grow flex-col">
                <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center">
                    <div className="flex flex-col w-full max-w-2xl py-5">
                        <div className="mb-8">
                            <h1 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight">{title[selection].title}</h1>
                            <p className="text-gray-600 mt-1">{title[selection].subtitle}</p>
                        </div>
                        <Tabs onSelectionChange={(s) => setSelection(s as SelectionType)} aria-label="Options">
                            <Tab key="register" title="Cadastrar">
                                <NewDelivery/>
                            </Tab>
                            <Tab key="list" title="Listar">
                                <DeliveryList/>
                            </Tab>
                        </Tabs>
                    </div>
                </main>
            </div>
        </DefaultLayout>
    );
};

export default Page;