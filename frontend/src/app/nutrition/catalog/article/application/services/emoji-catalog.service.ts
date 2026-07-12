import { Injectable } from "@angular/core";
import { EmojiGroup } from "../../../../../shared/design-system/emoji-picker/domain/models/emoji-group.model";

@Injectable()
export class EmojiCatalogService {
  groups(): EmojiGroup[] {
    return [
      {
        label: "Lácteos y huevos",
        items: [
          { emoji: "🥛", label: "Leche", keywords: ["lacteo", "batido"] },
          { emoji: "🧀", label: "Queso" },
          { emoji: "🧈", label: "Mantequilla" },
          { emoji: "🍦", label: "Helado" },
          { emoji: "🍨", label: "Helado tarrina", keywords: ["postre"] },
          { emoji: "🥚", label: "Huevo" },
          { emoji: "🍳", label: "Huevo frito", keywords: ["tortilla"] },
        ],
      },
      {
        label: "Fruta",
        items: [
          { emoji: "🍎", label: "Manzana" },
          { emoji: "🍏", label: "Manzana verde" },
          { emoji: "🍌", label: "Plátano", keywords: ["banana"] },
          { emoji: "🍊", label: "Naranja", keywords: ["mandarina"] },
          { emoji: "🍋", label: "Limón" },
          { emoji: "🍉", label: "Sandía" },
          { emoji: "🍇", label: "Uva" },
          { emoji: "🍓", label: "Fresa" },
          { emoji: "🫐", label: "Arándano" },
          { emoji: "🍒", label: "Cereza" },
          { emoji: "🍑", label: "Melocotón", keywords: ["durazno"] },
          { emoji: "🥭", label: "Mango" },
          { emoji: "🍍", label: "Piña" },
          { emoji: "🥝", label: "Kiwi" },
          { emoji: "🍐", label: "Pera" },
          { emoji: "🍈", label: "Melón" },
          { emoji: "🥥", label: "Coco" },
        ],
      },
      {
        label: "Verdura",
        items: [
          { emoji: "🥦", label: "Brócoli" },
          { emoji: "🥬", label: "Lechuga", keywords: ["verdura", "espinaca"] },
          { emoji: "🥒", label: "Pepino" },
          { emoji: "🌽", label: "Maíz" },
          { emoji: "🥕", label: "Zanahoria" },
          { emoji: "🫑", label: "Pimiento" },
          { emoji: "🍅", label: "Tomate" },
          { emoji: "🥔", label: "Patata" },
          { emoji: "🧅", label: "Cebolla" },
          { emoji: "🧄", label: "Ajo" },
          { emoji: "🍆", label: "Berenjena" },
          { emoji: "🥑", label: "Aguacate" },
          { emoji: "🍄", label: "Champiñón", keywords: ["seta"] },
          { emoji: "🫒", label: "Aceituna" },
        ],
      },
      {
        label: "Carne y pescado",
        items: [
          { emoji: "🍗", label: "Pollo", keywords: ["muslo", "ave"] },
          { emoji: "🍖", label: "Carne", keywords: ["costilla"] },
          { emoji: "🥩", label: "Filete", keywords: ["ternera", "cerdo"] },
          { emoji: "🥓", label: "Bacon", keywords: ["panceta"] },
          { emoji: "🌭", label: "Salchicha" },
          { emoji: "🍤", label: "Gamba", keywords: ["langostino", "marisco"] },
          { emoji: "🐟", label: "Pescado", keywords: ["merluza", "atun"] },
          { emoji: "🦑", label: "Calamar" },
          { emoji: "🦪", label: "Ostra", keywords: ["marisco"] },
        ],
      },
      {
        label: "Cereales y pan",
        items: [
          {
            emoji: "🌾",
            label: "Avena",
            keywords: ["cereal", "trigo", "copos"],
          },
          { emoji: "🥣", label: "Tazón", keywords: ["cereales", "muesli"] },
          { emoji: "🍞", label: "Pan" },
          { emoji: "🥐", label: "Croissant" },
          { emoji: "🥖", label: "Baguette", keywords: ["barra"] },
          { emoji: "🥯", label: "Bagel" },
          { emoji: "🫓", label: "Pan plano", keywords: ["tortilla", "wrap"] },
          { emoji: "🍚", label: "Arroz" },
          {
            emoji: "🍝",
            label: "Pasta",
            keywords: ["espagueti", "macarrones"],
          },
          { emoji: "🥨", label: "Pretzel" },
        ],
      },
      {
        label: "Legumbres y frutos secos",
        items: [
          { emoji: "🥜", label: "Cacahuete", keywords: ["crema", "mani"] },
          { emoji: "🌰", label: "Castaña", keywords: ["fruto seco"] },
          {
            emoji: "🫘",
            label: "Legumbre",
            keywords: ["alubia", "judia", "garbanzo", "lenteja"],
          },
        ],
      },
      {
        label: "Snacks y dulces",
        items: [
          { emoji: "🍫", label: "Chocolate" },
          { emoji: "🍪", label: "Galleta" },
          { emoji: "🍩", label: "Donut" },
          { emoji: "🍰", label: "Tarta", keywords: ["pastel"] },
          { emoji: "🧁", label: "Magdalena", keywords: ["muffin", "cupcake"] },
          { emoji: "🍬", label: "Caramelo", keywords: ["golosina"] },
          { emoji: "🍭", label: "Piruleta" },
          { emoji: "🍯", label: "Miel" },
          { emoji: "🍿", label: "Palomitas" },
          { emoji: "🥧", label: "Pie", keywords: ["empanada"] },
        ],
      },
      {
        label: "Bebidas",
        items: [
          { emoji: "💧", label: "Agua" },
          { emoji: "🥤", label: "Refresco", keywords: ["cola", "soda"] },
          { emoji: "🧃", label: "Zumo", keywords: ["jugo", "brick"] },
          { emoji: "🧋", label: "Bubble tea", keywords: ["batido"] },
          { emoji: "☕", label: "Café" },
          { emoji: "🍵", label: "Té", keywords: ["infusion"] },
          { emoji: "🧉", label: "Mate" },
          { emoji: "🍶", label: "Bebida", keywords: ["botella"] },
        ],
      },
      {
        label: "Preparados",
        items: [
          { emoji: "🍕", label: "Pizza" },
          { emoji: "🍔", label: "Hamburguesa" },
          { emoji: "🥪", label: "Sándwich", keywords: ["bocadillo"] },
          { emoji: "🌮", label: "Taco" },
          { emoji: "🌯", label: "Burrito", keywords: ["wrap"] },
          { emoji: "🥙", label: "Kebab", keywords: ["pita", "durum"] },
          { emoji: "🥗", label: "Ensalada" },
          { emoji: "🍱", label: "Bento", keywords: ["sushi", "japones"] },
          { emoji: "🍲", label: "Guiso", keywords: ["sopa", "puchero"] },
          { emoji: "🥘", label: "Paella", keywords: ["arroz", "cazuela"] },
        ],
      },
      {
        label: "Suplementos y otros",
        items: [
          {
            emoji: "💪",
            label: "Proteína",
            keywords: ["whey", "suplemento", "gym"],
          },
          { emoji: "🧂", label: "Sal" },
          { emoji: "🥫", label: "Conserva", keywords: ["lata", "enlatado"] },
          { emoji: "🫙", label: "Tarro", keywords: ["bote", "mermelada"] },
          { emoji: "🧊", label: "Hielo", keywords: ["congelado"] },
        ],
      },
    ];
  }
}
