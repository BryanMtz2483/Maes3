import { Head } from '@inertiajs/react';

export default function DashboardSimple() {
    return (
        <>
            <Head title="Dashboard Simple" />
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Dashboard Simple - React Funciona! ✅
                    </h1>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Si ves este mensaje, React está funcionando correctamente.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Card 1</h3>
                                <p className="text-blue-700 dark:text-blue-300">Contenido de prueba</p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900 p-4 rounded">
                                <h3 className="font-semibold text-green-900 dark:text-green-100">Card 2</h3>
                                <p className="text-green-700 dark:text-green-300">Contenido de prueba</p>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded">
                                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Card 3</h3>
                                <p className="text-purple-700 dark:text-purple-300">Contenido de prueba</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
