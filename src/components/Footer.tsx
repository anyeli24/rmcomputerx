const Footer = () => (
  <footer className="bg-dark text-dark-foreground py-10">
    <div className="container text-center">
      <p className="font-bold text-lg mb-2">RM COMPUTER</p>
      <p className="text-sm text-dark-foreground/70 mb-4">En tecnología y papelería donde lo encuentras todo.</p>
      <p className="text-xs text-dark-foreground/50">© {new Date().getFullYear()} RM COMPUTER. Todos los derechos reservados.</p>
    </div>
  </footer>
);

export default Footer;
