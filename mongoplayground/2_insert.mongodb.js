
// Select the database to use.
use('rapor724_v2');

db.sales.insertMany( [
   {
      foo: [
          { bar: [{ a: 1 }, { a: 2, test: 18 }] },
          { bar: [{ a: 1, test: 20 }, { a: 2, test: 18 }] }
      ]
  },
    {
      foo: [
          { bar: [{ a: 1, test: 40 }, { a: 2, test: 18 }] },
          { bar: [{ a: 1, test: 20 }, { a: 2, test: 18 }] }
      ]
  }
 ] )


