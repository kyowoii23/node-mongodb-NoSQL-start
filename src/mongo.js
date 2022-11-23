// @ts-check

require('dotenv').config()
const { MongoClient } = require('mongodb')

const uri = `mongodb+srv://superadmin:${process.env.MONGO_PASSWORD}@cluster0.7iskp.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  // @ts-ignore
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

async function main() {
  await client.connect()

  const users = client.db('fc22').collection('users')
  const cities = client.db('fc22').collection('cities')

  // Reset
  await users.deleteMany({})
  await cities.deleteMany({})

  // CRUD 간단하게 만들어보기

  // Init
  await cities.insertMany([
    {
      name: '서울',
      population: 1000,
    },
    {
      name: '부산',
      population: 350,
    },
  ])

  await users.insertMany([
    {
      name: 'Foo',
      birthYear: 2000,
      contacts: [
        {
          type: 'phone',
          number: '+821038603167',
        },
        {
          type: 'home',
          number: '+821012345678',
        },
      ],
      city: '서울',
    },
    {
      name: 'Bar',
      birthYear: 1995,
      city: '부산',
    },
    {
      name: 'Baz',
      birthYear: 1990,
      city: '부산',
    },
    {
      name: 'Poo',
      birthYear: 1993,
      city: '서울',
    },
  ])

  await users.deleteOne({
    name: 'Baz',
  })

  // users로 부터 cities를 합친 집합
  const cursor = users.aggregate([
    {
      // cities 컬렉션에서 name과 users 컬렉션의 city를 연관지어 city_info라는 이름으로 출력
      $lookup: {
        from: 'cities',
        localField: 'city',
        foreignField: 'name',
        as: 'city_info',
      },
    },
    {
      // 인구수는 500보다 높고 생일이 1995보다 높은 사람만 출력
      $match: {
        $and: [
          {
            'city_info.population': {
              $gte: 500,
            },
          },
          {
            birthYear: {
              $gte: 1995,
            },
          },
        ],
      },
    },
    {
      // 출력된 정보의 수
      $count: 'num_users',
    },
  ])

  await cursor.forEach(console.log)

  await client.close()
}

main()
