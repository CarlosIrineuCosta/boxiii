"""
Format Converter for Boxiii
Converts Builder data to Viewer-compatible format
"""

import json
import re
from datetime import datetime
from typing import Dict, List, Optional, Any
import random
from pathlib import Path

class FormatConverter:
    """Converts old Builder format to new Viewer format"""
    
    # Category color schemes
    CATEGORY_COLORS = {
        "wellness": {"primary": "#059669", "secondary": "#047857", "accent": "#34D399"},
        "health_fitness": {"primary": "#EF4444", "secondary": "#DC2626", "accent": "#F87171"},
        "nutrition": {"primary": "#F59E0B", "secondary": "#D97706", "accent": "#FCD34D"},
        "science_tech": {"primary": "#3B82F6", "secondary": "#2563EB", "accent": "#60A5FA"},
        "history_culture": {"primary": "#8B5CF6", "secondary": "#7C3AED", "accent": "#A78BFA"},
        "arts_creativity": {"primary": "#EC4899", "secondary": "#DB2777", "accent": "#F472B6"},
        "business_finance": {"primary": "#10B981", "secondary": "#059669", "accent": "#34D399"},
        "personal_development": {"primary": "#6366F1", "secondary": "#4F46E5", "accent": "#818CF8"},
        "education_learning": {"primary": "#14B8A6", "secondary": "#0D9488", "accent": "#2DD4BF"},
        "environment_sustainability": {"primary": "#22C55E", "secondary": "#16A34A", "accent": "#4ADE80"},
        "travel_geography": {"primary": "#0EA5E9", "secondary": "#0284C7", "accent": "#38BDF8"},
        "sports_recreation": {"primary": "#F97316", "secondary": "#EA580C", "accent": "#FB923C"},
        "cooking_culinary": {"primary": "#A855F7", "secondary": "#9333EA", "accent": "#C084FC"},
        "parenting_family": {"primary": "#E11D48", "secondary": "#BE123C", "accent": "#FB7185"},
        "spirituality_philosophy": {"primary": "#9333EA", "secondary": "#7C3AED", "accent": "#A78BFA"}
    }
    
    # Portuguese tags by category
    PORTUGUESE_TAGS = {
        "wellness": ["Bem-estar", "Saúde", "Qualidade de Vida", "Autocuidado"],
        "health_fitness": ["Fitness", "Exercícios", "Vida Ativa", "Condicionamento"],
        "nutrition": ["Nutrição", "Alimentação", "Dieta", "Vida Saudável"],
        "science_tech": ["Ciência", "Tecnologia", "Inovação", "Descobertas"],
        "history_culture": ["História", "Cultura", "Patrimônio", "Tradições"],
        "arts_creativity": ["Arte", "Criatividade", "Expressão", "Design"],
        "business_finance": ["Negócios", "Finanças", "Empreendedorismo", "Investimentos"],
        "personal_development": ["Desenvolvimento Pessoal", "Crescimento", "Habilidades", "Motivação"],
        "education_learning": ["Educação", "Aprendizado", "Conhecimento", "Ensino"],
        "environment_sustainability": ["Meio Ambiente", "Sustentabilidade", "Ecologia", "Verde"],
        "travel_geography": ["Viagem", "Geografia", "Destinos", "Aventura"],
        "sports_recreation": ["Esportes", "Recreação", "Atividades", "Lazer"],
        "cooking_culinary": ["Culinária", "Gastronomia", "Receitas", "Cozinha"],
        "parenting_family": ["Família", "Parentalidade", "Crianças", "Educação Familiar"],
        "spirituality_philosophy": ["Espiritualidade", "Filosofia", "Meditação", "Mindfulness"]
    }
    
    def __init__(self):
        self.set_counter = 1
        self.card_counter = 1
        self.creator_id_map = {}
    
    def clean_creator_id(self, old_id: str) -> str:
        """Convert complex creator ID to clean format"""
        if old_id in self.creator_id_map:
            return self.creator_id_map[old_id]
        
        # Remove UUID suffix if present
        clean_id = re.sub(r'_[a-f0-9]{8}$', '', old_id)
        
        # Further clean the ID
        clean_id = re.sub(r'[^a-z0-9_]', '', clean_id.lower())
        
        # Store mapping
        self.creator_id_map[old_id] = clean_id
        return clean_id
    
    def generate_set_number(self) -> str:
        """Generate sequential set number"""
        number = f"s{self.set_counter:03d}"
        self.set_counter += 1
        return number
    
    def generate_card_number(self) -> str:
        """Generate sequential card number"""
        number = f"c{self.card_counter:03d}"
        self.card_counter += 1
        return number
    
    def get_color_scheme(self, category: str) -> Dict[str, str]:
        """Get color scheme for category"""
        return self.CATEGORY_COLORS.get(
            category, 
            {"primary": "#6366F1", "secondary": "#4F46E5", "accent": "#818CF8"}
        )
    
    def get_portuguese_tags(self, category: str) -> List[str]:
        """Get Portuguese display tags"""
        tags = self.PORTUGUESE_TAGS.get(category, ["Conteúdo", "Educativo"])
        
        # Add special tags randomly
        special_tags = []
        if random.random() < 0.3:
            special_tags.append("Destaque Principal")
        if random.random() < 0.5:
            special_tags.append("Populares")
        if random.random() < 0.3:
            special_tags.append("Novo")
        
        return tags[:2] + special_tags[:1]
    
    def convert_creator(self, creator: Dict[str, Any]) -> Dict[str, Any]:
        """Convert creator to new format"""
        clean_id = self.clean_creator_id(creator.get("creator_id", ""))
        
        # Convert avatar and banner URLs
        avatar_url = creator.get("avatar_url", "")
        banner_url = creator.get("banner_url", "")
        
        if avatar_url and avatar_url.startswith("data/images/"):
            avatar_url = f"./images/creators/{clean_id}/avatar.jpg"
        elif not avatar_url:
            avatar_url = f"https://placehold.co/100x100/6366F1/FFF?text={clean_id[0].upper()}"
            
        if banner_url and banner_url.startswith("data/images/"):
            banner_url = f"./images/creators/{clean_id}/banner.jpg"
        elif not banner_url:
            banner_url = f"https://placehold.co/600x200/6366F1/FFF?text={creator.get('display_name', 'Creator')}"
        
        # Ensure proper datetime format
        created_at = creator.get("created_at", datetime.utcnow().isoformat())
        if not created_at.endswith("Z"):
            created_at = created_at.replace("+00:00", "Z")
        
        updated_at = creator.get("updated_at", created_at)
        if not updated_at.endswith("Z"):
            updated_at = updated_at.replace("+00:00", "Z")
        
        return {
            "creator_id": clean_id,
            "display_name": creator.get("display_name", ""),
            "platform": creator.get("platform", "multi"),
            "platform_handle": creator.get("platform_handle", ""),
            "avatar_url": avatar_url,
            "banner_url": banner_url,
            "description": creator.get("description", ""),
            "categories": creator.get("categories", []),
            "follower_count": creator.get("follower_count") or random.randint(1000, 100000),
            "verified": creator.get("verified", False),
            "social_links": creator.get("social_links", {}),
            "expertise_areas": creator.get("expertise_areas") or self._generate_expertise_areas(creator),
            "content_style": creator.get("content_style", "educational"),
            "created_at": created_at,
            "updated_at": updated_at
        }
    
    def convert_content_set(self, content_set: Dict[str, Any], set_number: str) -> Dict[str, Any]:
        """Convert content set to new format"""
        old_creator_id = content_set.get("creator_id", "")
        clean_creator_id = self.clean_creator_id(old_creator_id)
        
        category = content_set.get("category", "general")
        
        # Generate engaging title if needed
        title = content_set.get("title", "")
        if len(title) > 100 or "Conteúdo sobre" in title:
            title = self._generate_better_title(content_set)
        
        # Generate thumbnail and banner URLs
        thumbnail_url = f"./images/sets/{set_number}/thumbnail.jpg"
        banner_url = f"./images/sets/{set_number}/banner.jpg"
        
        # Determine if should be hero
        is_hero = random.random() < 0.2  # 20% chance
        
        # Generate learning outcomes if empty
        learning_outcomes = content_set.get("learning_outcomes", [])
        if not learning_outcomes:
            learning_outcomes = self._generate_learning_outcomes(content_set)
        
        # Ensure proper datetime format
        created_at = content_set.get("created_at", datetime.utcnow().isoformat())
        if not created_at.endswith("Z"):
            created_at = created_at.replace("+00:00", "Z")
        
        updated_at = content_set.get("updated_at", created_at)
        if not updated_at.endswith("Z"):
            updated_at = updated_at.replace("+00:00", "Z")
        
        return {
            "set_id": content_set.get("set_id", ""),
            "set_number": set_number,
            "creator_id": clean_creator_id,
            "title": title,
            "description": content_set.get("description", ""),
            "category": category,
            "thumbnail_url": thumbnail_url,
            "banner_url": banner_url,
            "card_count": content_set.get("card_count", 0),
            "estimated_time_minutes": content_set.get("estimated_time_minutes", 30),
            "difficulty_level": content_set.get("difficulty_level", "beginner"),
            "target_audience": content_set.get("target_audience", "Público geral"),
            "supported_navigation": content_set.get("supported_navigation", ["thematic", "random"]),
            "content_style": content_set.get("content_style", "story_driven"),
            "tags": content_set.get("tags", [])[:5],  # Limit to 5 tags
            "tags_pt": self.get_portuguese_tags(category),
            "is_hero": is_hero,
            "prerequisites": content_set.get("prerequisites", []),
            "learning_outcomes": learning_outcomes,
            "color_scheme": self.get_color_scheme(category),
            "stats": {
                "views": random.randint(100, 5000),
                "completion_rate": round(random.uniform(0.6, 0.95), 2)
            },
            "status": content_set.get("status", "published"),
            "language": content_set.get("language", "pt-BR"),
            "created_at": created_at,
            "updated_at": updated_at
        }
    
    def convert_card(self, card: Dict[str, Any], card_number: str, set_number: str) -> Dict[str, Any]:
        """Convert card to new format"""
        old_creator_id = card.get("creator_id", "")
        clean_creator_id = self.clean_creator_id(old_creator_id)
        
        # Generate question-style title if needed
        title = card.get("title", "")
        if not title.endswith("?") and random.random() < 0.7:
            title = self._make_question_title(title)
        
        # Create navigation contexts
        navigation_contexts = {
            "thematic": {
                "position": card.get("order_index", 1),
                "total_items": 10,  # Will be updated based on set
                "context_data": {
                    "theme": card.get("domain_data", {}).get("topic", "Tema Geral")
                }
            }
        }
        
        # Create media array
        media = []
        if random.random() < 0.8:  # 80% chance of having media
            media.append({
                "media_type": "image",
                "url": f"./images/sets/{set_number}/cards/{card_number}.jpg",
                "alt_text": f"Ilustração para {title}",
                "source": clean_creator_id,
                "license": "Educational Use",
                "validation_status": "verified",
                "last_checked": datetime.utcnow().isoformat() + "Z"
            })
        
        # Extract related concepts from tags
        tags = card.get("tags", [])
        related_concepts = tags[:3] if tags else ["conceito1", "conceito2", "conceito3"]
        
        # Ensure proper datetime format
        created_at = card.get("created_at", datetime.utcnow().isoformat())
        if not created_at.endswith("Z"):
            created_at = created_at.replace("+00:00", "Z")
        
        updated_at = card.get("updated_at", created_at)
        if not updated_at.endswith("Z"):
            updated_at = updated_at.replace("+00:00", "Z")
        
        return {
            "card_id": card.get("card_id", ""),
            "card_number": card_number,
            "set_id": card.get("set_id", ""),
            "creator_id": clean_creator_id,
            "title": title,
            "summary": card.get("summary", "")[:200],  # Limit summary length
            "detailed_content": card.get("detailed_content", ""),
            "order_index": card.get("order_index", 1),
            "navigation_contexts": navigation_contexts,
            "media": media,
            "domain_data": {
                "related_concepts": related_concepts
            },
            "tags": tags[:7],  # Limit to 7 tags
            "created_at": created_at,
            "updated_at": updated_at
        }
    
    def _generate_expertise_areas(self, creator: Dict) -> List[str]:
        """Generate expertise areas based on categories"""
        expertise_map = {
            "wellness": ["Bem-estar", "Saúde Mental", "Autocuidado"],
            "health_fitness": ["Fitness", "Saúde Física", "Exercícios"],
            "nutrition": ["Nutrição", "Alimentação Saudável", "Dietas"],
            "science_tech": ["Ciência", "Tecnologia", "Inovação"],
            "business_finance": ["Negócios", "Finanças", "Empreendedorismo"]
        }
        
        areas = []
        for category in creator.get("categories", []):
            areas.extend(expertise_map.get(category, []))
        
        return list(set(areas))[:3]  # Return up to 3 unique areas
    
    def _generate_better_title(self, content_set: Dict) -> str:
        """Generate a better, more engaging title"""
        category = content_set.get("category", "")
        
        title_templates = {
            "wellness": ["Jornada do Bem-estar", "Caminhos para o Equilíbrio", "Vida em Harmonia"],
            "health_fitness": ["Transforme seu Corpo", "Fitness para Todos", "Saúde em Movimento"],
            "nutrition": ["Nutrindo sua Vida", "Alimentação Consciente", "Sabor e Saúde"],
            "science_tech": ["Descobertas Fascinantes", "Ciência do Dia a Dia", "Tecnologia que Transforma"],
            "personal_development": ["Crescimento Pessoal", "Desenvolvendo Potenciais", "Jornada de Evolução"]
        }
        
        templates = title_templates.get(category, ["Conteúdo Educativo", "Aprendizado Interativo"])
        return random.choice(templates)
    
    def _generate_learning_outcomes(self, content_set: Dict) -> List[str]:
        """Generate learning outcomes based on category"""
        category = content_set.get("category", "")
        
        outcomes_map = {
            "wellness": [
                "Desenvolver práticas de autocuidado diário",
                "Identificar sinais de bem-estar físico e mental",
                "Criar rotinas saudáveis sustentáveis"
            ],
            "health_fitness": [
                "Executar exercícios com técnica correta",
                "Planejar rotinas de treino eficazes",
                "Compreender princípios de condicionamento físico"
            ],
            "nutrition": [
                "Fazer escolhas alimentares conscientes",
                "Planejar refeições balanceadas",
                "Compreender nutrientes essenciais"
            ]
        }
        
        return random.sample(
            outcomes_map.get(category, ["Adquirir novos conhecimentos", "Aplicar conceitos na prática"]),
            k=2
        )
    
    def _make_question_title(self, title: str) -> str:
        """Convert title to question format"""
        if ":" in title:
            parts = title.split(":", 1)
            return f"Como {parts[1].strip().lower()}?"
        
        words = title.lower().split()
        if words[0] in ["o", "a", "os", "as"]:
            return f"O que é {' '.join(words)}?"
        
        return f"Como entender {title.lower()}?"
    
    def convert_all(self, input_dir: str, output_dir: str):
        """Convert all JSON files from input to output directory"""
        input_path = Path(input_dir)
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Load original data
        with open(input_path / "creators.json", "r", encoding="utf-8") as f:
            creators = json.load(f)
        
        with open(input_path / "content_sets.json", "r", encoding="utf-8") as f:
            content_sets = json.load(f)
        
        with open(input_path / "cards.json", "r", encoding="utf-8") as f:
            cards = json.load(f)
        
        # Convert creators
        converted_creators = []
        for creator in creators:
            converted_creators.append(self.convert_creator(creator))
        
        # Convert content sets
        converted_sets = []
        set_numbers = {}  # Map old set_id to new set_number
        
        for content_set in content_sets:
            set_number = self.generate_set_number()
            set_numbers[content_set["set_id"]] = set_number
            converted_sets.append(self.convert_content_set(content_set, set_number))
        
        # Convert cards
        converted_cards = []
        cards_by_set = {}
        
        # Group cards by set
        for card in cards:
            set_id = card.get("set_id", "")
            if set_id not in cards_by_set:
                cards_by_set[set_id] = []
            cards_by_set[set_id].append(card)
        
        # Convert cards maintaining order within sets
        for set_id, set_cards in cards_by_set.items():
            set_cards.sort(key=lambda x: x.get("order_index", 0))
            self.card_counter = 1  # Reset for each set
            
            for card in set_cards:
                card_number = self.generate_card_number()
                set_number = set_numbers.get(set_id, "s000")
                converted_cards.append(self.convert_card(card, card_number, set_number))
        
        # Update card counts in sets
        for content_set in converted_sets:
            set_id = content_set["set_id"]
            card_count = len([c for c in converted_cards if c["set_id"] == set_id])
            content_set["card_count"] = card_count
            
            # Update navigation contexts total_items
            for card in converted_cards:
                if card["set_id"] == set_id:
                    card["navigation_contexts"]["thematic"]["total_items"] = card_count
        
        # Save converted data
        with open(output_path / "creators.json", "w", encoding="utf-8") as f:
            json.dump(converted_creators, f, ensure_ascii=False, indent=2)
        
        with open(output_path / "content_sets.json", "w", encoding="utf-8") as f:
            json.dump(converted_sets, f, ensure_ascii=False, indent=2)
        
        with open(output_path / "cards.json", "w", encoding="utf-8") as f:
            json.dump(converted_cards, f, ensure_ascii=False, indent=2)
        
        print(f"Conversion complete!")
        print(f"Converted {len(converted_creators)} creators")
        print(f"Converted {len(converted_sets)} content sets")
        print(f"Converted {len(converted_cards)} cards")
        print(f"Output saved to: {output_path}")


if __name__ == "__main__":
    # Example usage
    converter = FormatConverter()
    
    # Convert from current builder data to new format
    converter.convert_all(
        input_dir="../../builder/data",
        output_dir="../../viewer/public/data"
    )