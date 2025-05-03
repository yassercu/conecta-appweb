import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  CreditCard, 
  Settings,
  Star,
  PlusCircle,
  Store,
  Edit,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Line,
  LineChart, 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Datos simulados del negocio
const businessData = {
  name: "Café Del Barrio",
  type: "Cafeterías",
  description: "El mejor café de especialidad con un ambiente acogedor y servicio de primera.",
  address: "Calle Principal #123, Municipio A1, Provincia A",
  phone: "123-456-7890",
  email: "info@cafedelbarrio.com",
  rating: 4.8,
  totalReviews: 45,
  promoted: true,
  promotionExpiryDate: "2025-12-31",
  promotionPlan: "Destacado Premium",
  views: 1248,
  clicks: 345,
};

// Datos simulados para gráficos
const visitData = [
  { name: 'Ene', visitas: 150, clics: 60 },
  { name: 'Feb', visitas: 220, clics: 80 },
  { name: 'Mar', visitas: 180, clics: 70 },
  { name: 'Abr', visitas: 240, clics: 90 },
  { name: 'May', visitas: 280, clics: 120 },
  { name: 'Jun', visitas: 350, clics: 150 },
  { name: 'Jul', visitas: 410, clics: 170 },
];

// Datos simulados de productos
const productsData = [
  { id: 1, name: 'Café Espresso', price: 2.5, category: 'Bebidas', inStock: true },
  { id: 2, name: 'Café Americano', price: 3.0, category: 'Bebidas', inStock: true },
  { id: 3, name: 'Café Latte', price: 3.5, category: 'Bebidas', inStock: true },
  { id: 4, name: 'Pastel de Chocolate', price: 4.5, category: 'Postres', inStock: true },
  { id: 5, name: 'Sandwich de Jamón y Queso', price: 5.0, category: 'Comidas', inStock: true },
];

// Datos simulados de reseñas
const reviewsData = [
  { id: 1, author: 'María G.', rating: 5, comment: 'Excelente café y ambiente muy acogedor. Volveré pronto.', date: '2023-06-15', replied: true },
  { id: 2, author: 'Juan P.', rating: 4, comment: 'Muy buen servicio, aunque los precios son un poco altos.', date: '2023-05-28', replied: false },
  { id: 3, author: 'Ana L.', rating: 5, comment: 'El mejor café de la zona sin duda. Personal muy amable.', date: '2023-07-03', replied: false },
  { id: 4, author: 'Carlos M.', rating: 3, comment: 'La comida estaba buena, pero tuve que esperar demasiado.', date: '2023-06-22', replied: true },
];

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [business, setBusiness] = useState(businessData);
  const [products, setProducts] = useState(productsData);
  const [reviews, setReviews] = useState(reviewsData);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', inStock: true });
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [replies, setReplies] = useState({});

  // Función simulada para guardar cambios del negocio
  const handleSaveBusinessChanges = () => {
    // En una implementación real, aquí se enviarían los datos al servidor
    console.log("Guardando cambios del negocio:", business);
    setEditMode(false);
    // Mostrar mensaje de éxito
    alert("Cambios guardados correctamente");
  };

  // Función para agregar un nuevo producto
  const handleAddProduct = () => {
    // Validación básica
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Por favor, completa todos los campos");
      return;
    }
    
    // Crear nuevo producto
    const productToAdd = {
      id: products.length + 1,
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      inStock: newProduct.inStock,
    };
    
    // Actualizar lista de productos
    setProducts([...products, productToAdd]);
    
    // Limpiar formulario
    setNewProduct({ name: '', price: '', category: '', inStock: true });
    setShowNewProductForm(false);
  };

  // Función para eliminar un producto
  const handleDeleteProduct = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  // Función para guardar respuesta a reseña
  const handleSaveReply = (reviewId) => {
    const reply = replies[reviewId];
    if (!reply) {
      alert("Por favor, escribe una respuesta");
      return;
    }
    
    // Actualizar reseña con respuesta
    setReviews(reviews.map(review => 
      review.id === reviewId ? { ...review, replied: true } : review
    ));
    
    // Limpiar el campo de respuesta
    setReplies({...replies, [reviewId]: ''});
    
    // Mensaje de éxito
    alert("Respuesta enviada correctamente");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground">
            Gestiona tu negocio, productos y estadísticas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {business.promoted ? (
            <Badge variant="default" className="bg-yellow-500 text-black">
              Promoción Activa hasta {new Date(business.promotionExpiryDate).toLocaleDateString()}
            </Badge>
          ) : (
            <Button variant="outline" asChild>
              <a href="/payment">Promociona tu Negocio</a>
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden md:inline">Productos</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">Reseñas</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden md:inline">Pagos</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Configuración</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Resumen */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Visitas Totales
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{business.views}</div>
                <p className="text-xs text-muted-foreground">
                  +20% comparado con el mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clics a Contacto
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{business.clicks}</div>
                <p className="text-xs text-muted-foreground">
                  +15% comparado con el mes anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valoración Media
                </CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{business.rating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  Basado en {business.totalReviews} reseñas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Plan Activo
                </CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-md font-bold">{business.promoted ? business.promotionPlan : "Sin promoción"}</div>
                <p className="text-xs text-muted-foreground">
                  {business.promoted 
                    ? `Expira: ${new Date(business.promotionExpiryDate).toLocaleDateString()}` 
                    : "Contrata un plan para destacar"}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Visitas y Clics</CardTitle>
                <CardDescription>
                  Actividad de los últimos 7 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visitData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="visitas" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="clics" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Información de Negocio</CardTitle>
                <CardDescription>
                  Datos principales de tu negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <div className="text-sm font-medium">Nombre:</div>
                  <div className="text-sm">{business.name}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <div className="text-sm font-medium">Categoría:</div>
                  <div className="text-sm">{business.type}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <div className="text-sm font-medium">Dirección:</div>
                  <div className="text-sm">{business.address}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <div className="text-sm font-medium">Teléfono:</div>
                  <div className="text-sm">{business.phone}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <div className="text-sm font-medium">Email:</div>
                  <div className="text-sm">{business.email}</div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-1">
                  <div className="text-sm font-medium">Descripción:</div>
                  <div className="text-sm line-clamp-2">{business.description}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
                  Editar Información
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de Productos */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Catálogo de Productos</CardTitle>
                <CardDescription>
                  Gestiona los productos y servicios que ofreces
                </CardDescription>
              </div>
              <Button onClick={() => setShowNewProductForm(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </CardHeader>
            <CardContent>
              {showNewProductForm && (
                <div className="mb-6 p-4 border rounded-md bg-muted/50">
                  <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Producto</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Producto</Label>
                      <Input 
                        id="name" 
                        value={newProduct.name} 
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Ej: Café Espresso"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        step="0.01" 
                        value={newProduct.price} 
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="Ej: 2.50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Input 
                        id="category" 
                        value={newProduct.category} 
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        placeholder="Ej: Bebidas"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="inStock"
                        checked={newProduct.inStock}
                        onChange={() => setNewProduct({...newProduct, inStock: !newProduct.inStock})}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="inStock">Disponible</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowNewProductForm(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddProduct}>
                      Guardar Producto
                    </Button>
                  </div>
                </div>
              )}
              {products.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          {product.inStock ? (
                            <Badge>Disponible</Badge>
                          ) : (
                            <Badge variant="outline">Agotado</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => alert('Editar producto')}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No hay productos en tu catálogo. Agrega tu primer producto.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Reseñas */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reseñas de Clientes</CardTitle>
              <CardDescription>
                Valoración media: {business.rating.toFixed(1)} ({business.totalReviews} reseñas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{review.author}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm">{review.comment}</p>
                      
                      {review.replied ? (
                        <div className="mt-3 pl-4 border-l-2 border-primary/20">
                          <div className="font-medium text-sm">Tu respuesta:</div>
                          <p className="text-sm text-muted-foreground">
                            Gracias por tu comentario. Estamos trabajando para mejorar cada día.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <Label htmlFor={`reply-${review.id}`}>Responder a esta reseña:</Label>
                          <div className="flex gap-2 mt-1">
                            <Textarea 
                              id={`reply-${review.id}`}
                              placeholder="Escribe tu respuesta..."
                              value={replies[review.id] || ''}
                              onChange={(e) => setReplies({...replies, [review.id]: e.target.value})}
                              className="text-sm"
                            />
                            <Button size="sm" onClick={() => handleSaveReply(review.id)}>
                              Responder
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Aún no tienes reseñas de clientes.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Pagos */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>
                Registro de pagos por promociones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {business.promoted ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Período</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>12/12/2023</TableCell>
                      <TableCell>Destacado Premium</TableCell>
                      <TableCell>$192.00</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Pagado
                        </Badge>
                      </TableCell>
                      <TableCell>12/12/2023 - 12/12/2024</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>11/10/2023</TableCell>
                      <TableCell>Destacado Local</TableCell>
                      <TableCell>$10.00</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Pagado
                        </Badge>
                      </TableCell>
                      <TableCell>11/10/2023 - 11/11/2023</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No tienes promociones activas</p>
                  <Button asChild>
                    <a href="/payment">Promocionar Mi Negocio</a>
                  </Button>
                </div>
              )}
            </CardContent>
            {business.promoted && (
              <CardFooter className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Plan Actual: {business.promotionPlan}</p>
                  <p className="text-xs text-muted-foreground">
                    Expira el {new Date(business.promotionExpiryDate).toLocaleDateString()}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <a href="/payment">Cambiar Plan</a>
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>
                Administra tus métodos de pago guardados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Visa terminada en 4242</p>
                    <p className="text-sm text-muted-foreground">Expira: 12/25</p>
                  </div>
                </div>
                <Badge>Predeterminada</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                Agregar Método de Pago
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Pestaña de Configuración */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Negocio</CardTitle>
              <CardDescription>
                Actualiza la información de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Botones de acción */}
              <div className="flex justify-end space-x-2">
                {editMode ? (
                  <>
                    <Button variant="outline" onClick={() => setEditMode(false)}>Cancelar</Button>
                    <Button onClick={handleSaveBusinessChanges}>Guardar Cambios</Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Información
                  </Button>
                )}
              </div>
              
              {/* Formulario de edición del negocio */}
              <div className="space-y-4">
                {/* Nombre del negocio */}
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input
                    id="businessName"
                    value={business.name}
                    onChange={(e) => setBusiness({...business, name: e.target.value})}
                    disabled={!editMode}
                  />
                </div>
                
                {/* Tipo de negocio */}
                <div className="space-y-2">
                  <Label htmlFor="businessType">Tipo de Negocio</Label>
                  <Input
                    id="businessType"
                    value={business.type}
                    onChange={(e) => setBusiness({...business, type: e.target.value})}
                    disabled={!editMode}
                  />
                </div>
                
                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={business.description}
                    onChange={(e) => setBusiness({...business, description: e.target.value})}
                    disabled={!editMode}
                    rows={4}
                  />
                </div>
                
                {/* Dirección */}
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={business.address}
                    onChange={(e) => setBusiness({...business, address: e.target.value})}
                    disabled={!editMode}
                  />
                </div>
                
                {/* Teléfono y Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={business.phone}
                      onChange={(e) => setBusiness({...business, phone: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      value={business.email}
                      onChange={(e) => setBusiness({...business, email: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cambiar Contraseña</Button>
              <Button variant="destructive">Cerrar Sesión</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}