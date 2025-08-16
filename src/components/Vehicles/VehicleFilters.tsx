import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleFilters as VehicleFiltersType } from '@/types/vehicle';

interface VehicleFiltersProps {
  filters: VehicleFiltersType;
  onFiltersChange: (filters: VehicleFiltersType) => void;
  brands: string[];
}

const VehicleFilters = ({ filters, onFiltersChange, brands }: VehicleFiltersProps) => {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [brand, setBrand] = useState(filters.brand || '');
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
  const [minYear, setMinYear] = useState(filters.minYear || '');
  const [maxYear, setMaxYear] = useState(filters.maxYear || '');
  const [fuel_type, setFuelType] = useState(filters.fuel_type || '');
  const [transmission, setTransmission] = useState(filters.transmission || '');

  const applyFilters = () => {
    const newFilters: VehicleFiltersType = {
      search: search,
      status: status,
      brand: brand,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minYear: minYear ? parseFloat(minYear) : undefined,
      maxYear: maxYear ? parseFloat(maxYear) : undefined,
      fuel_type: fuel_type,
      transmission: transmission,
    };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
    setFuelType('');
    setTransmission('');
    onFiltersChange({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>خيارات البحث والتصفية</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">بحث</Label>
            <Input
              type="text"
              id="search"
              placeholder="ابحث عن طريق رقم اللوحة، الماركة أو الموديل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">الحالة</Label>
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                <SelectItem value="available">متاحة</SelectItem>
                <SelectItem value="rented">مؤجرة</SelectItem>
                <SelectItem value="maintenance">صيانة</SelectItem>
                <SelectItem value="out_of_service">خارج الخدمة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand">الماركة</Label>
            <Select value={brand} onValueChange={(value) => setBrand(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الماركة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="minPrice">السعر الأدنى</Label>
            <Input
              type="number"
              id="minPrice"
              placeholder="السعر الأدنى"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="maxPrice">السعر الأعلى</Label>
            <Input
              type="number"
              id="maxPrice"
              placeholder="السعر الأعلى"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

           <div>
            <Label htmlFor="minYear">سنة الصنع الأدنى</Label>
            <Input
              type="number"
              id="minYear"
              placeholder="سنة الصنع الأدنى"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="maxYear">سنة الصنع الأعلى</Label>
            <Input
              type="number"
              id="maxYear"
              placeholder="سنة الصنع الأعلى"
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fuel_type">نوع الوقود</Label>
            <Select value={fuel_type} onValueChange={(value) => setFuelType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الوقود" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                <SelectItem value="gasoline">بنزين</SelectItem>
                <SelectItem value="diesel">ديزل</SelectItem>
                <SelectItem value="hybrid">هايبرد</SelectItem>
                <SelectItem value="electric">كهربائي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transmission">ناقل الحركة</Label>
            <Select value={transmission} onValueChange={(value) => setTransmission(value)}>
              <SelectTrigger>
                <SelectValue placeholder="ناقل الحركة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                <SelectItem value="manual">يدوي</SelectItem>
                <SelectItem value="automatic">أوتوماتيك</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={clearFilters}>
            إعادة تعيين
          </Button>
          <Button type="button" onClick={applyFilters}>
            تطبيق الفلاتر
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleFilters;
