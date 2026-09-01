export type Hero6Slide = Readonly<{
  title: string;
  subtitle: string;
  description: string;
  image: string;
  color: string;
}>;

export const hero6SlidesDefaults: readonly Hero6Slide[] = [
  {
    title: "Work smarter.",
    subtitle: "Ship faster.",
    description: "The #1 project tool trusted by developers.",
    image:
      "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-blue-500",
  },
  {
    title: "Build together.",
    subtitle: "Scale better.",
    description: "Real-time collaboration and team management.",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-purple-500",
  },
  {
    title: "Track metrics.",
    subtitle: "Grow revenue.",
    description: "Powerful analytics. Your business goals met.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-orange-500",
  },
];
