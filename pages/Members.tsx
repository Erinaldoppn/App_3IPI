
import React, { useState, useEffect, useRef } from 'react';
import { supabase, isMocked } from '../supabase';
import { Member } from '../types';
import { Plus, Search, User as UserIcon, Loader2, X, Upload, Calendar, Phone, MapPin, Heart, Users as UsersIcon } from 'lucide-react';

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [idade, setIdade] = useState<number | string>('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [genero, setGenero] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Cálculo automático de idade
  useEffect(() => {
    if (dataNascimento) {
      const birthDate = new Date(dataNascimento);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setIdade(calculatedAge >= 0 ? calculatedAge : '');
    } else {
      setIdade('');
    }
  }, [dataNascimento]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('membros').select('*').order('nome');
      
      if (error) {
        console.error('Erro ao buscar membros:', error);
        if (isMocked) throw new Error('Mock mode');
      }

      if (data && data.length > 0) {
        setMembers(data);
      } else if (isMocked) {
        setMembers([
          { id: '1', nome: 'João Silva', foto_url: 'https://i.pravatar.cc/150?u=1', data_nascimento: '1990-05-15', telefone: '11999999999', created_at: '' },
          { id: '2', nome: 'Maria Oliveira', foto_url: 'https://i.pravatar.cc/150?u=2', data_nascimento: '1985-10-20', telefone: '11988888888', created_at: '' },
        ]);
      }
    } catch (err) {
      console.warn('Usando dados de demonstração.');
    } finally {
      setLoading(false);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let fotoUrl = '';

      if (fotoFile) {
        const fileExt = fotoFile.name.split('.').pop();
        const fileName = `membro-${Date.now()}.${fileExt}`;
        const filePath = `membros/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('midia')
          .upload(filePath, fotoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('midia')
          .getPublicUrl(filePath);
        
        fotoUrl = publicUrl;
      }

      const { error } = await supabase.from('membros').insert([{
        nome,
        data_nascimento: dataNascimento,
        telefone,
        endereco,
        genero,
        estado_civil: estadoCivil,
        foto_url: fotoUrl
      }]);

      if (error) throw error;

      setShowAddModal(false);
      resetForm();
      fetchMembers();
    } catch (err: any) {
      alert('Erro ao cadastrar: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNome('');
    setDataNascimento('');
    setIdade('');
    setTelefone('');
    setEndereco('');
    setGenero('');
    setEstadoCivil('');
    setFotoFile(null);
    setFotoPreview(null);
  };

  const filteredMembers = members.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Membros da Família 3IPI</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie o cadastro de todos os membros da nossa comunidade.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-brand-darkBlue transition-all font-bold shadow-lg shadow-brand-blue/20 active:scale-95"
        >
          <Plus size={20} />
          <span>Novo Membro</span>
        </button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-gray-900 dark:text-white transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-blue" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="group flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-transparent hover:border-brand-blue/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="relative mb-4">
                <div className="relative overflow-hidden rounded-full w-24 h-24 border-4 border-gray-50 dark:border-gray-700 group-hover:border-brand-blue transition-colors duration-300">
                  {member.foto_url ? (
                    <img src={member.foto_url} alt={member.nome} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <UserIcon size={40} className="text-gray-400 group-hover:text-brand-blue transition-colors" />
                    </div>
                  )}
                </div>
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-lg truncate w-full">{member.nome}</p>
              <p className="text-xs text-gray-400 mb-2">{member.telefone || 'Sem telefone'}</p>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-brand-blue uppercase tracking-wider">
                Membro
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-brand-blue text-white">
              <h2 className="text-xl font-bold flex items-center">
                <UsersIcon className="mr-2" /> Cadastro de Membro
              </h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Foto Upload */}
                <div className="md:col-span-1 flex flex-col items-center justify-start space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-brand-blue transition-all overflow-hidden relative group"
                  >
                    {fotoPreview ? (
                      <img src={fotoPreview} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="text-center p-2">
                        <Upload className="mx-auto text-gray-400 mb-1" size={24} />
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Foto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <Plus className="text-white" />
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFotoChange} accept="image/*" />
                  <p className="text-[10px] text-gray-400 font-medium text-center uppercase tracking-widest">Toque para alterar</p>
                </div>

                {/* Campos de Texto */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome Completo</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-brand-blue dark:text-white" placeholder="Nome do membro" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nascimento</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="date" required value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-brand-blue dark:text-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Idade</label>
                    <input readOnly value={idade} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-brand-blue" placeholder="-" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-brand-blue dark:text-white" placeholder="(00) 00000-0000" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gênero</label>
                    <select value={genero} onChange={(e) => setGenero(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-brand-blue dark:text-white">
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado Civil</label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-brand-blue dark:text-white">
                        <option value="">Selecione</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Endereço</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-brand-blue dark:text-white" placeholder="Rua, Número, Bairro" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all">Cancelar</button>
                <button disabled={submitting} type="submit" className="flex-1 bg-brand-blue text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-blue/20 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50">
                  {submitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                  <span>{submitting ? 'Salvando...' : 'Finalizar Cadastro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
