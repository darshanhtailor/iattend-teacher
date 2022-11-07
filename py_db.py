import pymongo

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['i-attend']
col_attend = db['attendances']
col_records = db['records']

def insert(vid, students):
    # print(vid, students)
    d = {'video_name': vid, 'students': students}
    col_attend.insert_one(d)

def update(vid):
    query = { 'video_name': vid }
    new_values = { '$set': { 'is_processed': 'true' } }

    col_records.update_one(query, new_values)