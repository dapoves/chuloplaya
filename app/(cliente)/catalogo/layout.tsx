// Layout necesario para que la ruta paralela @sheet funcione.
// Renderiza el catálogo principal (children) y, encima, el slot del sheet.
export default function CatalogoLayout({
  children,
  sheet,
}: Readonly<{
  children: React.ReactNode;
  sheet: React.ReactNode;
}>) {
  return (
    <>
      {children}
      {sheet}
    </>
  );
}
