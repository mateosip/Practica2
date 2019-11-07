import {GraphQLServer} from 'graphql-yoga'
import * as uuid from 'uuid'

const recetasArray = [{
    id: "1",
    titulo: "Receta1",
    descripcion:"bonito",
    fecha: "23/23/23",
    autor: "3",
    ingredientes: ["2"]
}];
const authorData = [
    {
        id: "3",
        nombre: "Mateo",
        email: "mateosip@gmail"
    }
];
const ingredientesData = [{
    id:"2",
    nombre:"azucar",
    recetasPropias:[]
}];
//POnemos id porque en las bases de datos nosotros nos vamos a andar refiriendo con ids, pero luego cuando hagamos las querys, lo que va a pasar es qeu vamos  a 
//cambiar el id por el nombre con lo que habiamos explicado el otro dia en clase
const typeDefs = `
    type Recetas{
        id: ID!
        titulo: String!
        description: String!
        fecha: String!
        autor: Autores!
        ingredientes: [Ingredientes!]!
    }

    type Autores{
        id: ID!
        nombre: String!
        email: String!
        listaRecetas: [Recetas!]
    }

    type Ingredientes{
        id: ID!
        nombre: String!
        recetasPropias: [Recetas!]
    }
    type Query{
        autor: [Autores!]
        ingredientes: [Ingredientes!]
        recetas(autor:ID,ingredientes:ID):[Recetas!]!
        
        
    }
    type Mutation{
        addRecetas(titulo: String!, descripcion: String!,autor: String!,ingredientes:[String!]!):Recetas!
        addAutor(nombre:String!,email:String!):Autores!
        addIngredientes(nombre: String!):Ingredientes!
        removeRecetas(id:ID!):Recetas
        removeAutor(id:ID!):Autores
        removeIngredientes(id:ID!):Ingredientes
        actualizarAutor(id:ID!,nombre:String,email:String):Autores!
        actualizarReceta(id:ID!,titulo:String,descripcion:String):Recetas!
        actualizarIngrediente(id:ID!,nombre:String):Ingredientes!
    }

`
//Cuando hago la query por algo autor(con id) devuelvo un Autores de verdad, no por su id.

const resolvers ={
    Recetas:{
        autor:(parent,args,ctx,info)=>{
            const autorID = parent.autor;
            return authorData.find(obj=> obj.id === autorID);
        },
        ingredientes:(parent,args,ctx,info)=>{
            const ingredientesID = parent.ingredientes;
            return ingredientesData.filter(obj => ingredientesID.includes(obj.id));
        }
        
    },
    Query:{
        recetas:(parent,args,ctx,info)=>{
            const result = recetasArray.filter(obj => obj.id === (args.autor || obj.id))
                                        .filter(elem => elem.id === (args.ingredientes || elem.id));
            return result;
        },
        autor:(parent,args,ctx,info)=>{
            return authorData;
        },
        ingredientes:(parent,args,ctx,info)=>{
            return ingredientesData;
        }
        
    },
//LO del array de recetas meterlo después con lo que hicimos el otro día en clase, cuando haga la query, qeu lo compruebe, llamadno a lo que tengo que crear como lo de post...
    Mutation:{
        //Cuando es relación, es decir uno de otro, se hace referencia con su id
        addRecetas:(parent,args,ctx,info)=>{
            const {titulo,descripcion,autor,ingredientes} = args;
            if(!authorData.some(elem=> elem.id === autor)){
                throw new Error(`El autor ${autor} no existe`);
            }
            console.log(ingredientesData);
            ingredientes.forEach(elem=>{
                if(!ingredientesData.some(obj=> obj.id === elem)){
                    throw new Error(`El ingrediente ${elem} no existe`);
                }
            })
            if(recetasArray.some(obj => obj.titulo === titulo)){
                throw new Error(`La receta ${titulo}ya esta anadida`);
            }
            var date = new Date();
            var dia = String(date.getDate()).padStart(2,'0');
            var mes = String(date.getDate() + 1).padStart(2,'0');
            var ano = date.getFullYear();
            date = `${dia}/${mes}/${ano}`;
            const fecha = date;
            
            const receta = {
                titulo,descripcion,fecha,autor,ingredientes,id: uuid.v4()
            }
            recetasArray.push(receta);
            return receta;
        },
        //Cuando hacemos una query, nos devuelve un id, y en los resolvers, hacemos que cada vez qeu nos devuelva un author o tipo post, que lo filtre de tal manera.
        addAutor:(parent,args,ctx,info)=>{
            const{nombre,email} = args;
            if(authorData.some(obj => obj.email === email)){
                throw new Error(`User email ${email}already in use`);
            }

            const autor = {
                nombre,
                email,
                id: uuid.v4()
            }
            authorData.push(autor);
            return autor;
        },
        addIngredientes:(parent,args,ctx,info)=>{
            const{nombre} = args;
            if(ingredientesData.some(obj => obj.nombre === nombre)){
                throw new Error(`El ingrediente ${nombre}ya existe`);
            }


            const ingrediente = {
                nombre,
                id: uuid.v4()
            }
            ingredientesData.push(ingrediente);
            return ingrediente;
        },
        removeRecetas:(parent,args,ctx,info)=>{
            const recetaID = args.id;
            if(!recetasArray.some(obj => obj.id === recetaID)){
                throw new Error(`La receta ${recetaID} no existe`);
            }
            return recetasArray.splice(recetasArray.findIndex(obj => obj.id === recetaID),1);
        },
        removeAutor:(parent,args,ctx,info)=>{
            const autorID = args.id;
            if(!authorData.some(obj => obj.id === autorID)){
                throw new Error(`El autor ${autorID}no existe`);
            }
          /*  recetasArray.splice(recetasArray.findIndex(obj => obj.autor === autorID));
            authorData.splice(authorData.findIndex(obj => obj.id === autorID),1);*/
            recetasArray.forEach((elem,i) =>{
                if(elem.autor === autorID){
                    recetasArray.splice(i,1);
                }
            })
            authorData.splice(authorData.findIndex(obj => obj.id === autorID),1);

            //Tengo que borrar las recetas que ha hecho el autor cuyo id es el anterior.
            
            /*const index = recetasArray.findIndex(obj => obj.autor === autorID);
            recetasArray.splice(recetasArray.findIndex(obj => recetasArray.includes(autorID),1));*/
            /*recetasArray.forEach(elem=>{
                    recetasArray.splice(recetasArray.findIndex(obj => obj.id === elem.autor),1);
            })*/

        },
        removeIngredientes:(parent,args,ctx,info)=>{
            const ingredienteID = args.id;
            if(!ingredientesData.some(obj => obj.id === ingredienteID)){
                throw new Error(`EL ingrediente ${ingredienteID} no existe`);
            }
            recetasArray.forEach((elem,i) => {
                    if(elem.ingredientes.includes(ingredienteID)){
                        recetasArray.splice(i,1);
                    }
                
            })
            ingredientesData.splice(ingredientesData.findIndex(obj => obj.id === ingredienteID),1);
        },
        actualizarAutor:(parent,args,ctx,info)=>{
            const {id,nombre,email} = args;
            if(!authorData.some(obj => obj.id === id)){
                throw new Error(`El autor ${autor} no existe`);
            }
            const autor = authorData.find(obj => obj.id === id);
            autor.nombre = nombre;
            autor.email = email;
            return autor;
        },
        actualizarReceta:(parent,args,ctx,info)=>{
            const{id,titulo,descripcion} = args;
            if(!recetasArray.some(obj => obj.id === id)){
                throw new Error(`La receta  ${ id} no existe`);
            }
            const receta = recetasArray.find(obj => obj.id === id);
            receta.titulo = titulo;
            receta.descripcion = descripcion;
            return receta;
        },
        actualizarIngrediente:(parent,args,ctx,info)=>{
            const{id,nombre} = args;
            if(!ingredientesData.some(obj => obj.id === id)){
                throw new Error(`El ingrediente ${ id} no existe`);
            }
            const ingrediente = ingredientesData.find(obj => obj.id === id);
            ingrediente.nombre = nombre;
            return ingrediente;
        }

    }
}
const server = new GraphQLServer({typeDefs,resolvers});
server.start(()=>console.log("Server Started"));