import { ShieldCheck, Users, Star, Heart } from "lucide-react";

const features = [
  { icon: <Star className="w-6 h-6" />, title: "Variedad", desc: "Amplio catálogo de productos tecnológicos y de papelería." },
  { icon: <ShieldCheck className="w-6 h-6" />, title: "Calidad", desc: "Productos de marcas reconocidas con garantía de calidad." },
  { icon: <Users className="w-6 h-6" />, title: "Atención", desc: "Servicio personalizado y asesoría para cada cliente." },
  { icon: <Heart className="w-6 h-6" />, title: "Comunidad", desc: "Comprometidos con el desarrollo de nuestra comunidad local en Maimón." },
];

const About = () => (
  <section id="nosotros" className="py-20 bg-secondary">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Sobre Nosotros</h2>
        <p className="text-muted-foreground text-lg">
          En <strong className="text-primary">RM COMPUTER</strong> somos tu aliado en tecnología y papelería. 
          Ofrecemos una amplia variedad de productos de calidad, con precios accesibles y un servicio al cliente excepcional. 
          Nos enorgullece ser parte de la comunidad de Maimón, República Dominicana.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div key={f.title} className="bg-background rounded-xl p-6 shadow-sm border border-border hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default About;
