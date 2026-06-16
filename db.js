// ===================================
// BANCOS DE DADOS
// ===================================
const dbProdutos = new PouchDB('loja_produtos');
const dbUsuarios = new PouchDB('loja_usuarios');


// ===================================
// DADOS INICIAIS
// ===================================
async function inicializarBanco() {

  // Admin padrão
  try {
    await dbUsuarios.get('admin');
  } catch (e) {
    await dbUsuarios.put({
      _id: 'admin',
      nome: 'Administrador',
      email: 'admin@loja.com',
      senha: 'admin123',
      tipo: 'admin'
    });
  }

  // Produtos padrão
  try {
    await dbProdutos.get('prod1');
  } catch (e) {
    await dbProdutos.bulkDocs([
      {
        _id: 'prod1',
        nome: 'Fone Bluetooth',
        categoria: 'Eletronicos',
        preco: 219.90,
        descricao: 'Cancelamento de ruído, 30h de bateria.',
        imagem: '🎧',
        destaque: true
      },
      {
        _id: 'prod2',
        nome: 'Smartwatch',
        categoria: 'Eletronicos',
        preco: 349.90,
        descricao: 'Monitor cardíaco e GPS integrado.',
        imagem: '⌚',
        destaque: true
      },
      {
        _id: 'prod3',
        nome: 'Sofá 3 Lugares',
        categoria: 'Moveis',
        preco: 1299.90,
        descricao: 'Tecido suede premium, estrutura em madeira.',
        imagem: '🛋️',
        destaque: true
      },
      {
        _id: 'prod4',
        nome: 'Tênis Running',
        categoria: 'Calcados',
        preco: 289.90,
        descricao: 'Solado em borracha, palmilha ortopédica.',
        imagem: '👟',
        destaque: false
      },
      {
        _id: 'prod5',
        nome: 'Mochila Urbana',
        categoria: 'Acessorios',
        preco: 189.90,
        descricao: 'Compartimento para notebook, resistente à água.',
        imagem: '🎒',
        destaque: false
      }
    ]);
  }

} // <- fecha inicializarBanco

inicializarBanco(); // <- chama a função


// ===================================
// FUNÇÕES DE PRODUTOS
// ===================================
const Produtos = {

  async listar() {
    const resultado = await dbProdutos.allDocs({ include_docs: true });
    return resultado.rows.map(r => r.doc);
  },

  async buscarPorId(id) {
    try {
      return await dbProdutos.get(id);
    } catch (e) {
      return null;
    }
  },

  async adicionar(dados) {
    const id = 'prod_' + Date.now();
    return await dbProdutos.put({ _id: id, ...dados });
  },

  async editar(id, dados) {
    const doc = await dbProdutos.get(id);
    return await dbProdutos.put({ ...doc, ...dados });
  },

  async excluir(id) {
    const doc = await dbProdutos.get(id);
    return await dbProdutos.remove(doc);
  }

};


// ===================================
// FUNÇÕES DE USUÁRIOS
// ===================================
const Usuarios = {

  async listar() {
    const resultado = await dbUsuarios.allDocs({ include_docs: true });
    return resultado.rows.map(r => r.doc);
  },

  async buscarPorEmail(email) {
    const todos = await this.listar();
    return todos.find(u => u.email === email) || null;
  },

  async adicionar(dados) {
    const existe = await this.buscarPorEmail(dados.email);
    if (existe) throw new Error('Email já cadastrado.');
    const id = 'user_' + Date.now();
    return await dbUsuarios.put({ _id: id, ...dados });
  },

  async editar(id, dados) {
    const doc = await dbUsuarios.get(id);
    return await dbUsuarios.put({ ...doc, ...dados });
  },

  async excluir(id) {
    if (id === 'admin') throw new Error('Não é possível remover o admin principal.');
    const doc = await dbUsuarios.get(id);
    return await dbUsuarios.remove(doc);
  }

};


// ===================================
// AUTENTICAÇÃO
// ===================================
const Auth = {

  async login(email, senha) {
    const usuario = await Usuarios.buscarPorEmail(email);
    if (!usuario) return { ok: false, msg: 'Usuário não encontrado.' };
    if (usuario.senha !== senha) return { ok: false, msg: 'Senha incorreta.' };

    localStorage.setItem('sessao', JSON.stringify({
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    }));

    return { ok: true, usuario };
  },

  logout() {
    localStorage.removeItem('sessao');
  },

  getSessao() {
    const dados = localStorage.getItem('sessao');
    return dados ? JSON.parse(dados) : null;
  },

  isAdmin() {
    const sessao = this.getSessao();
    return sessao && sessao.tipo === 'admin';
  }

};