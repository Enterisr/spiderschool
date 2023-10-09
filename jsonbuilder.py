from datetime import datetime
import json
import random


def random_date():
    first_date = datetime.strptime('1/1/1971', '%m/%d/%Y')
    second_date = datetime.strptime('1/1/2001', '%m/%d/%Y')
    first_timestamp = int(first_date.timestamp())
    second_timestamp = int(second_date.timestamp())
    random_timestamp = random.randint(first_timestamp, second_timestamp)
    return datetime.fromtimestamp(random_timestamp)


professions = ["cleaner", "servant", "simple sailor", "apprentice sailor", "prison guard", "prisoner",
               "lookout", "weaponeer", "helmsman", "pazamink sailor", "monkey", "captain", "second in command"]

data = []
genders = ["female", "male", "prefers not to say"]
ship = range(0, 4)
with open('names.txt') as names:
    for idx, name in enumerate(names):
        name = name[:-1]
        profession = random.choice(professions)
        gender = random.choice(genders)
        ship = random.randint(0, 4)
        isHasWoodenLeg = random.choice(["true", "false"])
        date = random_date().__str__()[:-9]
        data.append({'id': idx, 'name': name, 'gender': gender,
                     'profession': profession, 'birthday': date, "ship": ship, "has_wooden_leg": isHasWoodenLeg})

json_data = json.dumps(data)
with open('data.json', "w") as file:
    file.write(json_data)
print(json_data)
