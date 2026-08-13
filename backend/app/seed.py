import json

from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal, engine
from app.models import Base, Course, Exercise, Lesson, Skill, Unit, User, UserProgress


def _ex(lesson_id: int, order: int, etype: str, prompt: str, content: dict, solution: dict) -> Exercise:
    return Exercise(
        lesson_id=lesson_id,
        order_index=order,
        exercise_type=etype,
        prompt=prompt,
        content_json=json.dumps(content),
        solution_json=json.dumps(solution),
    )


def seed_if_empty() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).first():
            return
        _seed(db)
        db.commit()
    finally:
        db.close()


def _seed(db: Session) -> None:
    learners = [
        User(
            username="aniket",
            display_name="Aniket",
            total_xp=80,
            current_streak=5,
            hearts=4,
            gems=420,
            daily_xp_goal=settings.daily_xp_goal,
            xp_today=10,
            is_default=True,
            timezone="Asia/Kolkata",
        ),
        User(username="maya", display_name="Maya", total_xp=240, current_streak=12, hearts=5, gems=900),
        User(username="leo", display_name="Leo", total_xp=180, current_streak=4, hearts=5, gems=200),
        User(username="priya", display_name="Priya", total_xp=95, current_streak=2, hearts=5, gems=150),
        User(username="sam", display_name="Sam", total_xp=40, current_streak=1, hearts=5, gems=50),
    ]
    db.add_all(learners)
    db.flush()

    course = Course(title="Spanish", language_code="es", from_language="English")
    db.add(course)
    db.flush()

    u1 = Unit(
        course_id=course.id,
        title="Unit 1",
        description="Order food, drink, and greet people",
        order_index=1,
        color="#58CC02",
    )
    u2 = Unit(
        course_id=course.id,
        title="Unit 2",
        description="Talk about family and home",
        order_index=2,
        color="#1CB0F6",
    )
    u3 = Unit(
        course_id=course.id,
        title="Unit 3",
        description="Describe travel and places",
        order_index=3,
        color="#CE82FF",
    )
    db.add_all([u1, u2, u3])
    db.flush()

    skills_spec = [
        (u1.id, "Greetings", 1, "wave"),
        (u1.id, "Introductions", 2, "id"),
        (u1.id, "Cafe", 3, "coffee"),
        (u2.id, "Family", 1, "people"),
        (u2.id, "Home", 2, "home"),
        (u3.id, "Travel", 1, "plane"),
        (u3.id, "City", 2, "city"),
    ]
    skills: list[Skill] = []
    for unit_id, title, order, icon in skills_spec:
        s = Skill(unit_id=unit_id, title=title, order_index=order, icon=icon)
        db.add(s)
        db.flush()
        skills.append(s)

    lessons_by_skill: dict[int, list[Lesson]] = {}
    for skill in skills:
        pair = []
        for i, title in enumerate((f"{skill.title} 1", f"{skill.title} 2"), start=1):
            les = Lesson(skill_id=skill.id, title=title, order_index=i, xp_reward=settings.lesson_xp)
            db.add(les)
            db.flush()
            pair.append(les)
        lessons_by_skill[skill.id] = pair

    # --- Greetings ---
    g1, g2 = lessons_by_skill[skills[0].id]
    db.add_all(
        [
            _ex(
                g1.id, 1, "multiple_choice", "Select the meaning of “Hola”",
                {"options": ["Goodbye", "Hello", "Please", "Thanks"]},
                {"index": 1},
            ),
            _ex(
                g1.id, 2, "translate_bank", "Translate: Hello",
                {"bank": ["Hola", "Adiós", "Yo", "casa"]},
                {"words": ["Hola"]},
            ),
            _ex(
                g1.id, 3, "match_pairs", "Match the pairs",
                {
                    "left": ["Hello", "Goodbye", "Please"],
                    "right": ["Adiós", "Hola", "Por favor"],
                },
                {"pairs": {"Hello": "Hola", "Goodbye": "Adiós", "Please": "Por favor"}},
            ),
            _ex(
                g1.id, 4, "fill_blank", "Complete: ____, María",
                {"sentence": "____, María", "hint": "hello"},
                {"accepted": ["hola"]},
            ),
            _ex(
                g1.id, 5, "type_answer", "Type the Spanish for “goodbye”",
                {},
                {"accepted": ["adios", "adiós"]},
            ),
            _ex(
                g2.id, 1, "multiple_choice", "How do you say “good morning”?",
                {"options": ["Buenas noches", "Buenos días", "Hasta luego", "De nada"]},
                {"index": 1},
            ),
            _ex(
                g2.id, 2, "translate_bank", "Translate: How are you?",
                {"bank": ["¿", "Cómo", "estás", "?", "casa", "el"]},
                {"words": ["¿", "Cómo", "estás", "?"]},
            ),
            _ex(
                g2.id, 3, "type_answer", "Type “thank you” in Spanish",
                {},
                {"accepted": ["gracias"]},
            ),
        ]
    )

    # --- Introductions ---
    i1, i2 = lessons_by_skill[skills[1].id]
    db.add_all(
        [
            _ex(
                i1.id, 1, "multiple_choice", "“Me llamo Ana” means",
                {"options": ["I am hungry", "My name is Ana", "I live in Ana", "See you Ana"]},
                {"index": 1},
            ),
            _ex(
                i1.id, 2, "translate_bank", "Translate: I am Luis",
                {"bank": ["Yo", "soy", "Luis", "eres", "casa"]},
                {"words": ["Yo", "soy", "Luis"]},
            ),
            _ex(
                i1.id, 3, "fill_blank", "Yo ____ María",
                {"sentence": "Yo ____ María"},
                {"accepted": ["soy"]},
            ),
            _ex(
                i1.id, 4, "type_answer", "Type “nice to meet you” in Spanish (2 words)",
                {},
                {"accepted": ["mucho gusto"]},
            ),
            _ex(
                i2.id, 1, "match_pairs", "Match the phrases",
                {
                    "left": ["I am", "You are", "My name is"],
                    "right": ["Me llamo", "Yo soy", "Tú eres"],
                },
                {"pairs": {"I am": "Yo soy", "You are": "Tú eres", "My name is": "Me llamo"}},
            ),
            _ex(
                i2.id, 2, "multiple_choice", "Choose the correct introduction",
                {"options": ["Yo eres Pedro", "Yo soy Pedro", "Yo está Pedro", "Yo llama Pedro"]},
                {"index": 1},
            ),
            _ex(
                i2.id, 3, "translate_bank", "Translate: Nice to meet you",
                {"bank": ["Mucho", "gusto", "Adiós", "el"]},
                {"words": ["Mucho", "gusto"]},
            ),
        ]
    )

    # --- Cafe ---
    c1, c2 = lessons_by_skill[skills[2].id]
    db.add_all(
        [
            _ex(
                c1.id, 1, "multiple_choice", "“Agua” means",
                {"options": ["Bread", "Water", "Coffee", "Milk"]},
                {"index": 1},
            ),
            _ex(
                c1.id, 2, "translate_bank", "Translate: I want coffee",
                {"bank": ["Quiero", "café", "leche", "el"]},
                {"words": ["Quiero", "café"]},
            ),
            _ex(
                c1.id, 3, "fill_blank", "Quiero ____ (water)",
                {"sentence": "Quiero ____"},
                {"accepted": ["agua"]},
            ),
            _ex(
                c1.id, 4, "type_answer", "Type the Spanish word for “please”",
                {},
                {"accepted": ["por favor"]},
            ),
            _ex(
                c2.id, 1, "match_pairs", "Match the drinks",
                {
                    "left": ["Coffee", "Milk", "Water"],
                    "right": ["Leche", "Café", "Agua"],
                },
                {"pairs": {"Coffee": "Café", "Milk": "Leche", "Water": "Agua"}},
            ),
            _ex(
                c2.id, 2, "multiple_choice", "How do you order bread?",
                {"options": ["Quiero pan", "Soy pan", "Estoy pan", "Tengo pan por"]},
                {"index": 0},
            ),
            _ex(
                c2.id, 3, "translate_bank", "Translate: The bread please",
                {"bank": ["El", "pan", "por", "favor", "casa"]},
                {"words": ["El", "pan", "por", "favor"]},
            ),
        ]
    )

    # --- Family ---
    f1, f2 = lessons_by_skill[skills[3].id]
    db.add_all(
        [
            _ex(
                f1.id, 1, "multiple_choice", "“Madre” means",
                {"options": ["Father", "Mother", "Sister", "Brother"]},
                {"index": 1},
            ),
            _ex(
                f1.id, 2, "translate_bank", "Translate: My brother",
                {"bank": ["Mi", "hermano", "hermana", "el"]},
                {"words": ["Mi", "hermano"]},
            ),
            _ex(
                f1.id, 3, "type_answer", "Type “father” in Spanish",
                {},
                {"accepted": ["padre"]},
            ),
            _ex(
                f2.id, 1, "match_pairs", "Match the family words",
                {
                    "left": ["Mother", "Father", "Sister"],
                    "right": ["Padre", "Madre", "Hermana"],
                },
                {"pairs": {"Mother": "Madre", "Father": "Padre", "Sister": "Hermana"}},
            ),
            _ex(
                f2.id, 2, "fill_blank", "Mi ____ es Ana (sister)",
                {"sentence": "Mi ____ es Ana"},
                {"accepted": ["hermana"]},
            ),
            _ex(
                f2.id, 3, "multiple_choice", "Choose “my family”",
                {"options": ["Mi casa", "Mi familia", "Mi agua", "Mi café"]},
                {"index": 1},
            ),
        ]
    )

    # --- Home ---
    h1, h2 = lessons_by_skill[skills[4].id]
    db.add_all(
        [
            _ex(
                h1.id, 1, "multiple_choice", "“Casa” means",
                {"options": ["Car", "House", "Cat", "Chair"]},
                {"index": 1},
            ),
            _ex(
                h1.id, 2, "translate_bank", "Translate: The house is big",
                {"bank": ["La", "casa", "es", "grande", "pequeña"]},
                {"words": ["La", "casa", "es", "grande"]},
            ),
            _ex(
                h1.id, 3, "type_answer", "Type “door” in Spanish",
                {},
                {"accepted": ["puerta"]},
            ),
            _ex(
                h2.id, 1, "fill_blank", "La ____ es azul (door)",
                {"sentence": "La ____ es azul"},
                {"accepted": ["puerta"]},
            ),
            _ex(
                h2.id, 2, "match_pairs", "Match the rooms",
                {
                    "left": ["Kitchen", "Bedroom", "House"],
                    "right": ["Casa", "Cocina", "Dormitorio"],
                },
                {"pairs": {"Kitchen": "Cocina", "Bedroom": "Dormitorio", "House": "Casa"}},
            ),
            _ex(
                h2.id, 3, "multiple_choice", "Choose “I live here”",
                {"options": ["Yo vivo aquí", "Yo soy aquí", "Yo quiero aquí", "Yo estoy casa"]},
                {"index": 0},
            ),
        ]
    )

    # --- Travel ---
    t1, t2 = lessons_by_skill[skills[5].id]
    db.add_all(
        [
            _ex(
                t1.id, 1, "multiple_choice", "“Tren” means",
                {"options": ["Plane", "Train", "Bus", "Boat"]},
                {"index": 1},
            ),
            _ex(
                t1.id, 2, "translate_bank", "Translate: The train",
                {"bank": ["El", "tren", "avión", "una"]},
                {"words": ["El", "tren"]},
            ),
            _ex(
                t1.id, 3, "type_answer", "Type “airport” in Spanish",
                {},
                {"accepted": ["aeropuerto"]},
            ),
            _ex(
                t2.id, 1, "fill_blank", "El ____ es grande (plane)",
                {"sentence": "El ____ es grande"},
                {"accepted": ["avion", "avión"]},
            ),
            _ex(
                t2.id, 2, "match_pairs", "Match travel words",
                {
                    "left": ["Train", "Plane", "Ticket"],
                    "right": ["Boleto", "Tren", "Avión"],
                },
                {"pairs": {"Train": "Tren", "Plane": "Avión", "Ticket": "Boleto"}},
            ),
            _ex(
                t2.id, 3, "multiple_choice", "Choose “I need a ticket”",
                {"options": ["Necesito un boleto", "Soy un boleto", "Quiero soy tren", "El tren yo"]},
                {"index": 0},
            ),
        ]
    )

    # --- City ---
    y1, y2 = lessons_by_skill[skills[6].id]
    db.add_all(
        [
            _ex(
                y1.id, 1, "multiple_choice", "“Calle” means",
                {"options": ["Park", "Street", "School", "Store"]},
                {"index": 1},
            ),
            _ex(
                y1.id, 2, "translate_bank", "Translate: The park",
                {"bank": ["El", "parque", "calle", "una"]},
                {"words": ["El", "parque"]},
            ),
            _ex(
                y1.id, 3, "type_answer", "Type “school” in Spanish",
                {},
                {"accepted": ["escuela"]},
            ),
            _ex(
                y2.id, 1, "fill_blank", "La ____ es larga (street)",
                {"sentence": "La ____ es larga"},
                {"accepted": ["calle"]},
            ),
            _ex(
                y2.id, 2, "match_pairs", "Match city words",
                {
                    "left": ["Park", "School", "Store"],
                    "right": ["Tienda", "Parque", "Escuela"],
                },
                {"pairs": {"Park": "Parque", "School": "Escuela", "Store": "Tienda"}},
            ),
            _ex(
                y2.id, 3, "multiple_choice", "Choose “Where is the store?”",
                {
                    "options": [
                        "¿Dónde está la tienda?",
                        "¿Soy la tienda?",
                        "¿Quiero está parque?",
                        "La tienda yo dónde",
                    ]
                },
                {"index": 0},
            ),
        ]
    )

    default = learners[0]
    # Unlock first two skills; complete first greetings lesson
    first_lesson = lessons_by_skill[skills[0].id][0]
    db.add(
        UserProgress(
            user_id=default.id,
            skill_id=skills[0].id,
            lesson_id=first_lesson.id,
            completed=True,
            crown_level=1,
        )
    )
