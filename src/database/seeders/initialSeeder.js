export async function runInitialSeeders(database) {
  const reasonsCollection = database.get('reasons');
  const productsCollection = database.get('products');

  // Dados iniciais para reasons
  const initialReasons = [
    // { code: '01', description: 'Produto Vencido' },
    // { code: '02', description: 'Produto Danificado' },
    // { code: '03', description: 'Erro de Contagem' },
    // { code: '04', description: 'Roubo/Furto' },
    // { code: '05', description: 'Ajuste de Inventário Positivo' },
    // { code: '06', description: 'Ajuste de Inventário Negativo' },
    // { code: '07', description: 'Transferência entre Lojas' },
    // { code: '08', description: 'Devolução de Cliente' },
  ];

  // Dados iniciais para products
  const initialProducts = [
    { product_code: '7890000000001', product_name: 'Arroz Tipo 1 5kg', regular_price: 25.99, club_price: 22.99, unit_type: 'UN' },
    { product_code: '7890000000002', product_name: 'Feijão Carioca 1kg', regular_price: 8.49, club_price: 7.99, unit_type: 'UN' },
    { product_code: '7890000000003', product_name: 'Batata Lavada kg', regular_price: 5.99, club_price: 4.99, unit_type: 'KG' },
    { product_code: '7890000000004', product_name: 'Açúcar Cristal 1kg', regular_price: 4.50, club_price: 3.99, unit_type: 'UN' },
    { product_code: '7890000000005', product_name: 'Óleo de Soja 900ml', regular_price: 6.80, club_price: 5.99, unit_type: 'UN' },
    { product_code: '7890000000006', product_name: 'Leite Integral 1L', regular_price: 5.20, club_price: 4.79, unit_type: 'UN' },
    { product_code: '7890000000007', product_name: 'Café Torrado 500g', regular_price: 12.90, club_price: 11.50, unit_type: 'UN' },
    { product_code: '7890000000008', product_name: 'Farinha de Trigo 1kg', regular_price: 4.20, club_price: 3.79, unit_type: 'UN' },
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
          product.product_code = productData.product_code;
          product.product_name = productData.product_name;
          product.regular_price = productData.regular_price;
          product.club_price = productData.club_price;
          product.unit_type = productData.unit_type;
          // Campos de timestamp serão gerenciados automaticamente pelo WatermelonDB
        })
      )
    );
  });

  console.log('Seeders executados com sucesso!');
}
