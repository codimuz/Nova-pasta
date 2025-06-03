"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInitialSeeders = runInitialSeeders;
async function runInitialSeeders(database) {
    const reasonsCollection = database.get('reasons');
    const productsCollection = database.get('products');
    const currentTimestamp = new Date().getTime();
    // Dados iniciais para reasons
    const initialReasons = [
        { code: '01', description: 'Produto Vencido', created_at: currentTimestamp, updated_at: currentTimestamp },
        { code: '02', description: 'Produto Danificado', created_at: currentTimestamp, updated_at: currentTimestamp },
        { code: '03', description: 'Erro de Contagem', created_at: currentTimestamp, updated_at: currentTimestamp },
        { code: '04', description: 'Roubo/Furto', created_at: currentTimestamp, updated_at: currentTimestamp },
        { code: '05', description: 'Ajuste de Inventário Positivo', created_at: currentTimestamp, updated_at: currentTimestamp },
        { code: '06', description: 'Ajuste de Inventário Negativo', created_at: currentTimestamp, updated_at: currentTimestamp },
        { code: '07', description: 'Transferência entre Lojas', created_at: currentTimestamp, updated_at: currentTimestamp },
        { code: '08', description: 'Devolução de Cliente', created_at: currentTimestamp, updated_at: currentTimestamp },
    ];
    // Dados iniciais para products
    const initialProducts = [
        { product_code: '7890000000001', product_name: 'Arroz Tipo 1 5kg', regular_price: 25.99, club_price: 22.99, unit_type: 'UN', created_at: currentTimestamp, updated_at: currentTimestamp },
        { product_code: '7890000000002', product_name: 'Feijão Carioca 1kg', regular_price: 8.49, club_price: 7.99, unit_type: 'UN', created_at: currentTimestamp, updated_at: currentTimestamp },
        { product_code: '7890000000003', product_name: 'Batata Lavada kg', regular_price: 5.99, club_price: 4.99, unit_type: 'KG', created_at: currentTimestamp, updated_at: currentTimestamp },
    ];
    // Inserir dados iniciais
    await database.write(async () => {
        await Promise.all(initialReasons.map(reason => reasonsCollection.create(record => {
            record.code = reason.code;
            record.description = reason.description;
            record.created_at = reason.created_at;
            record.updated_at = reason.updated_at;
        })));
        await Promise.all(initialProducts.map(product => productsCollection.create(record => {
            record.product_code = product.product_code;
            record.product_name = product.product_name;
            record.regular_price = product.regular_price;
            record.club_price = product.club_price;
            record.unit_type = product.unit_type;
            record.created_at = product.created_at;
            record.updated_at = product.updated_at;
        })));
    });
    console.log('Seeders executados com sucesso!');
}
