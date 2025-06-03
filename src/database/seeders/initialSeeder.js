export async function runInitialSeeders(database) {
  const reasonsCollection = database.get('reasons');
  const productsCollection = database.get('products');

  // Dados iniciais para reasons
  const initialReasons = [
    { code: '01', description: 'Produto Vencido' },
    { code: '02', description: 'Produto Danificado' },
    { code: '03', description: 'Erro de Contagem' },
    { code: '04', description: 'Roubo/Furto' },
    { code: '05', description: 'Ajuste de Inventário Positivo' },
    { code: '06', description: 'Ajuste de Inventário Negativo' },
    { code: '07', description: 'Transferência entre Lojas' },
    { code: '08', description: 'Devolução de Cliente' },
  ];

  // Dados iniciais para products
  const initialProducts = [
    { product_code: '7890000000001', product_name: 'Arroz Tipo 1 5kg', regular_price: 25.99, club_price: 22.99, unit_type: 'UN' },
    { product_code: '7890000000002', product_name: 'Feijão Carioca 1kg', regular_price: 8.49, club_price: 7.99, unit_type: 'UN' },
    { product_code: '7890000000003', product_name: 'Batata Lavada kg', regular_price: 5.99, club_price: 4.99, unit_type: 'KG' },
  ];

  // Inserir dados iniciais
  await database.write(async () => {
    await Promise.all(
      initialReasons.map(reasonData =>
        reasonsCollection.create(reason => {
          reason.code = reasonData.code;
          reason.description = reasonData.description;
          // NÃO definir createdAt (ainda é @readonly - será gerenciado automaticamente)
          // Definir updatedAt manualmente (removemos @readonly conforme Passo 1)
          reason.updatedAt = new Date();
        })
      )
    );

    await Promise.all(
      initialProducts.map(productData =>
        productsCollection.create(product => {
          product.productCode = productData.product_code;
          product.productName = productData.product_name;
          product.regularPrice = productData.regular_price;
          product.clubPrice = productData.club_price;
          product.unitType = productData.unit_type;
          // Para produtos, assumindo que os timestamps também podem precisar de ajuste similar
          // Mas vamos focar nos Reasons primeiro
        })
      )
    );
  });

  console.log('Seeders executados com sucesso!');
}
